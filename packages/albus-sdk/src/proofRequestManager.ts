/*
 * This file is part of Albus code.
 *
 * Copyright (c) 2023, mFactory GmbH
 *
 * Albus is free software: you can redistribute it
 * and/or modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * Albus is distributed in the hope that it
 * will be useful, but WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.
 * If not, see <https://www.gnu.org/licenses/agpl-3.0.html>.
 *
 * You can be released from the requirements of the Affero GNU General Public License
 * by purchasing a commercial license. The purchase of such a license is
 * mandatory as soon as you develop commercial activities using the
 * Albus code without disclosing the source code of
 * your own applications.
 *
 * The developer of this program can be contacted at <info@albus.finance>.
 */

import * as Albus from '@mfactory-lab/albus-core'
import type { AnchorProvider } from '@coral-xyz/anchor'
import type { Commitment, ConfirmOptions, PublicKeyInitData } from '@solana/web3.js'
import { ComputeBudgetProgram, Keypair, PublicKey, Transaction } from '@solana/web3.js'
import type { CircuitManager } from './circuitManager'
import type { CredentialManager } from './credentialManager'
import type {
  ProofData,
  ProofRequestStatus,
} from './generated'
import {
  Circuit,
  Policy,
  ProofRequest,
  createCreateProofRequestInstruction,
  createDeleteProofRequestInstruction,
  createProveInstruction, createVerifyInstruction, errorFromCode, proofRequestDiscriminator,
} from './generated'
import type { PdaManager } from './pda'
import type { BundlrStorageDriver } from './StorageDriver'
import type { PrivateKey } from './types'
import { getSolanaTimestamp, prepareInputs } from './utils'

export class ProofRequestManager {
  constructor(
    readonly provider: AnchorProvider,
    readonly circuit: CircuitManager,
    readonly credential: CredentialManager,
    readonly storage: BundlrStorageDriver,
    readonly pda: PdaManager,
  ) {
  }

  /**
   * Load proof request by {@link addr}
   */
  async load(addr: PublicKeyInitData, commitment?: Commitment) {
    return ProofRequest.fromAccountAddress(this.provider.connection, new PublicKey(addr), commitment)
  }

  /**
   * Load proof request with additional `policy` and `circuit`
   * reduce rpc requests by using `getMultipleAccountsInfo`
   */
  async loadFull(addr: PublicKeyInitData, commitment?: Commitment) {
    const proofRequest = await this.load(addr, commitment)
    const accounts = await this.provider.connection.getMultipleAccountsInfo([
      proofRequest.policy,
      proofRequest.circuit,
      // proofRequest.serviceProvider,
    ])
    return {
      proofRequest,
      policy: accounts[0] ? Policy.fromAccountInfo(accounts[0])[0] : undefined,
      circuit: accounts[1] ? Circuit.fromAccountInfo(accounts[1])[0] : undefined,
    }
  }

  /**
   * Find proof requests
   */
  async find(props: FindProofRequestProps = {}) {
    const builder = ProofRequest.gpaBuilder()
      .addFilter('accountDiscriminator', proofRequestDiscriminator)

    if (props.withoutData) {
      builder.config.dataSlice = { offset: 0, length: 0 }
    }

    if (!props.skipUser) {
      builder.addFilter('owner', new PublicKey(props.user ?? this.provider.publicKey))
    }

    if (props.serviceProvider) {
      builder.addFilter('serviceProvider', new PublicKey(props.serviceProvider))
    } else if (props.serviceProviderCode) {
      builder.addFilter('serviceProvider', this.pda.serviceProvider(props.serviceProviderCode)[0])
    }

    if (props.circuit) {
      builder.addFilter('circuit', new PublicKey(props.circuit))
    } else if (props.circuitCode) {
      builder.addFilter('circuit', this.pda.circuit(props.circuitCode)[0])
    }

    if (props.policy) {
      builder.addFilter('policy', new PublicKey(props.policy))
    }

    if (props.policyId) {
      const id = props.policyId.split('_')
      builder.addFilter('policy', this.pda.policy(id[0]!, id[1]!)[0])
    }

    if (props.status) {
      builder.addFilter('status', props.status)
    }

    return (await builder.run(this.provider.connection)).map((acc) => {
      return {
        pubkey: acc.pubkey,
        data: !props.withoutData ? ProofRequest.fromAccountInfo(acc.account)[0] : null,
      }
    })
  }

  /**
   * Create new proof request
   */
  async create(props: CreateProofRequestProps, opts?: ConfirmOptions) {
    const authority = this.provider.publicKey
    const [serviceProvider] = this.pda.serviceProvider(props.serviceCode)
    const [policy] = this.pda.policy(serviceProvider, props.policyCode)
    const [proofRequest] = this.pda.proofRequest(policy, authority)

    const instruction = createCreateProofRequestInstruction(
      {
        serviceProvider,
        proofRequest,
        policy,
        authority,
      },
      {
        data: {
          expiresIn: props.expiresIn ?? 0,
        },
      },
    )

    try {
      const tx = new Transaction().add(instruction)
      const signature = await this.provider.sendAndConfirm(tx, [], opts)
      return { address: proofRequest, signature }
    } catch (e: any) {
      throw errorFromCode(e.code) ?? e
    }
  }

  /**
   * Delete proof request
   */
  async delete(props: DeleteProofRequestProps, opts?: ConfirmOptions) {
    const authority = this.provider.publicKey
    const instruction = createDeleteProofRequestInstruction({
      proofRequest: new PublicKey(props.proofRequest),
      authority,
    })

    try {
      const tx = new Transaction().add(instruction)
      const signature = await this.provider.sendAndConfirm(tx, [], opts)
      return { signature }
    } catch (e: any) {
      throw errorFromCode(e.code) ?? e
    }
  }

  /**
   * Change proof request status
   * Required admin authority
   */
  async changeStatus(props: ChangeStatus, opts?: ConfirmOptions) {
    const instruction = createVerifyInstruction(
      {
        proofRequest: new PublicKey(props.proofRequest),
        authority: this.provider.publicKey,
      },
      {
        data: {
          status: props.status,
        },
      },
    )

    try {
      const tx = new Transaction().add(instruction)
      const signature = await this.provider.sendAndConfirm(tx, [], opts)
      return { signature }
    } catch (e: any) {
      throw errorFromCode(e.code) ?? e
    }
  }

  /**
   * Verify Proof request
   */
  async verify(props: VerifyProps) {
    const proofRequest = await this.load(props.proofRequest)
    if (!proofRequest.proof) {
      throw new Error('Unable to verify the request, probably it\'s not proved')
    }
    const circuit = await this.circuit.load(proofRequest.circuit)
    const vk = Albus.zkp.decodeVerifyingKey(circuit.vk)
    const proof = await Albus.zkp.decodeProof(proofRequest.proof)
    const publicInput = Albus.zkp.decodePublicSignals(proofRequest.publicInputs)
    return Albus.zkp.verifyProof({ vk, proof, publicInput })
  }

  /**
   * Prove the {@link ProofRequest}
   * - Create Verifiable Presentation
   * - Encrypt Verifiable Presentation
   * - Generate ZK-Proof
   * - Upload Verifiable Presentation to arweave
   * - Verify ZK-Proof on-chain
   */
  async fullProve(props: FullProveProps) {
    const { proofRequest, circuit, policy } = await this.loadFull(props.proofRequest)

    if (!circuit) {
      throw new Error(`Unable to find Circuit account at ${proofRequest.circuit}`)
    }

    if (!policy) {
      throw new Error(`Unable to find Policy account at ${proofRequest.policy}`)
    }

    const vc = await this.credential.load(props.vc, { decryptionKey: props.decryptionKey })

    const vp = await Albus.credential.createVerifiablePresentation({
      credentials: [vc],
      exposedFields: props.exposedFields,
      holderSecretKey: props.holderSecretKey,
    })

    const input = await prepareInputs({
      now: await getSolanaTimestamp(this.provider.connection),
      circuit,
      policy,
      vp,
    })

    const holder = Keypair.fromSecretKey(Uint8Array.from(props.holderSecretKey))

    const encryptedPresentation = await Albus.credential.encryptVerifiablePresentation(vp, {
      pubkey: holder.publicKey,
      // encryptionKey: [],
    })

    let proofResult: Awaited<ReturnType<typeof Albus.zkp.generateProof>>

    try {
      proofResult = await Albus.zkp.generateProof({
        wasmFile: circuit.wasmUri!,
        zkeyFile: circuit.zkeyUri!,
        input,
      })
    } catch (e: any) {
      // console.log(e)
      throw new Error(`Proof generation failed. Circuit constraint violation (${e.message})`)
    }

    const { proof, publicSignals } = proofResult
    const presentationUri = await this.storage.uploadData(JSON.stringify(encryptedPresentation))

    const { signature } = await this.prove({
      proofRequest: props.proofRequest,
      proof,
      publicSignals,
      presentationUri,
    })

    // TODO: type error for PublicSignals
    return { signature, proof, publicSignals, presentationUri }
  }

  /**
   * Prove the proof request
   */
  async prove(props: ProveProps, opts?: ConfirmOptions) {
    const authority = this.provider.publicKey
    const proofRequest = await this.load(props.proofRequest)

    const proof = await Albus.zkp.encodeProof(props.proof)
    const publicInputs = Albus.zkp.encodePublicSignals(props.publicSignals)

    const instruction = createProveInstruction(
      {
        proofRequest: new PublicKey(props.proofRequest),
        circuit: proofRequest.circuit,
        policy: proofRequest.policy,
        authority,
      },
      {
        data: {
          uri: props.presentationUri,
          publicInputs,
          proof,
        },
      },
    )

    try {
      const tx = new Transaction()
        .add(ComputeBudgetProgram.setComputeUnitLimit({ units: 200000 }))
        .add(instruction)
      const signature = await this.provider.sendAndConfirm(tx, [], opts)
      return { signature }
    } catch (e: any) {
      // console.log(e)
      throw errorFromCode(e.code) ?? e
    }
  }

  /**
   * Validates proof request.
   *
   * @param {ProofRequest} req The proof request object to validate.
   * @throws An error with a message indicating why the request is invalid.
   */
  async validate(req: ProofRequest) {
    const slot = await this.provider.connection.getSlot()
    const timestamp = await this.provider.connection.getBlockTime(slot)
    if (!timestamp) {
      throw new Error('Failed to get solana block time')
    }
    if (Number(req.expiredAt) > 0 && Number(req.expiredAt) < timestamp) {
      throw new Error('Proof request is expired')
    }
    // if (!req.proof) {
    //   throw new Error('Proof request is not proved yet')
    // }
    if (Number(req.verifiedAt) <= 0) {
      throw new Error('Proof request is not verified')
    }
  }
}

export interface CreateProofRequestProps {
  serviceCode: string
  policyCode: string
  expiresIn?: number
}

export interface DeleteProofRequestProps {
  proofRequest: PublicKeyInitData
}

export interface FindProofRequestProps {
  user?: PublicKeyInitData
  serviceProvider?: PublicKeyInitData
  serviceProviderCode?: string
  circuit?: PublicKeyInitData
  circuitCode?: string
  policy?: PublicKeyInitData
  policyId?: string
  status?: ProofRequestStatus
  skipUser?: boolean
  withoutData?: boolean
}

export interface FullProveProps {
  proofRequest: PublicKeyInitData
  vc: PublicKeyInitData
  holderSecretKey: Uint8Array | number[]
  exposedFields?: string[]
  decryptionKey?: PrivateKey
}

export interface VerifyProps {
  proofRequest: PublicKeyInitData
}

export interface ProveProps {
  proofRequest: PublicKeyInitData
  proof: ProofData
  publicSignals: (string | number | bigint)[]
  presentationUri: string
}

export interface ChangeStatus {
  proofRequest: PublicKeyInitData
  status: ProofRequestStatus
}
