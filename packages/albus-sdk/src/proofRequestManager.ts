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
import type {
  Commitment,
  ConfirmOptions,
  GetMultipleAccountsConfig,
  PublicKeyInitData,
} from '@solana/web3.js'
import { ComputeBudgetProgram, PublicKey, Transaction } from '@solana/web3.js'
import { chunk } from 'lodash-es'
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
  ServiceProvider,
  createCreateProofRequestInstruction,
  createDeleteProofRequestInstruction, createProveInstruction, createVerifyInstruction,
  errorFromCode, proofRequestDiscriminator,
} from './generated'
import type { PdaManager } from './pda'
import type { ServiceManager } from './serviceManager'
import type { PrivateKey } from './types'
import { ProofInputBuilder, getSolanaTimestamp } from './utils'

export class ProofRequestManager {
  constructor(
    readonly provider: AnchorProvider,
    readonly circuit: CircuitManager,
    readonly service: ServiceManager,
    readonly credential: CredentialManager,
    readonly pda: PdaManager,
  ) {
  }

  /**
   * Load a proof request based on its public key address.
   *
   * @param {PublicKeyInitData} addr - The public key address of the proof request to load.
   * @param {Commitment} [commitment] - Optional commitment level for loading the proof request.
   * @returns {Promise<ProofRequest>} A Promise that resolves to the loaded proof request.
   */
  async load(addr: PublicKeyInitData, commitment?: Commitment) {
    return ProofRequest.fromAccountAddress(this.provider.connection, new PublicKey(addr), commitment)
  }

  /**
   * Load multiple proof requests
   */
  async loadMultiple(addrs: PublicKey[], commitmentOrConfig?: Commitment | GetMultipleAccountsConfig) {
    return (await this.provider.connection.getMultipleAccountsInfo(addrs, commitmentOrConfig))
      .filter(acc => acc !== null)
      .map(acc => ProofRequest.fromAccountInfo(acc!)[0])
  }

  /**
   * Load a full set of data associated with a proof request,
   * including the service, policy and circuit information.
   *
   * @param {PublicKeyInitData} addr - The public key address of the proof request to load.
   * @param {Array<keyof LoadFullResult>} props - Extra accounts
   * @param {Commitment} [commitment] - Optional commitment level for loading the data.
   * @returns {Promise<{proofRequest:ProofRequest, policy?:Policy, circuit?:Circuit}>} A Promise that resolves to an object containing the loaded proof request, associated policy, and circuit information.
   * @throws {Error} Throws an error if there is an issue during the loading process.
   */
  async loadFull(
    addr: PublicKeyInitData,
    props: Array<Exclude<keyof LoadFullResult, 'proofRequest'>> = [],
    commitment?: Commitment,
  ) {
    const proofRequest = await this.load(addr, commitment)
    const pubKeys = props.map(key => proofRequest[key])
    const result: LoadFullResult = { proofRequest }

    if (pubKeys.length > 0) {
      const accountInfos = await this.provider.connection.getMultipleAccountsInfo(pubKeys)
      for (let i = 0; i < props.length; i++) {
        const prop = props[i]!
        const accountInfo = accountInfos[i]
        if (accountInfo) {
          result[prop as any] = (() => {
            switch (prop) {
              case 'circuit': return Circuit.fromAccountInfo(accountInfo)[0]
              case 'policy': return Policy.fromAccountInfo(accountInfo)[0]
              case 'serviceProvider': return ServiceProvider.fromAccountInfo(accountInfo)[0]
            }
          })()
        }
      }
    }

    return result
  }

  /**
   * Find proof requests based on specified criteria.
   *
   * @param {FindProofRequestProps} [props] - Optional properties for customizing the proof request search.
   * @returns {Promise<Array<{pubkey:PublicKey,data:ProofRequest}>>} A Promise that resolves to an array of proof request results.
   */
  async find(props: FindProofRequestProps = {}) {
    const builder = ProofRequest.gpaBuilder()
      .addFilter('accountDiscriminator', proofRequestDiscriminator)

    if (props.withoutData) {
      builder.config.dataSlice = {
        offset: 0,
        length: 0,
      }
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
   * Create a new proof request with the specified properties.
   *
   * @param {CreateProofRequestProps} props - The properties for creating the proof request.
   * @param {ConfirmOptions} [opts] - Optional confirmation options for the transaction.
   * @returns {Promise<{signature:string,address:PublicKey}>} A Promise that resolves to the result of creating the proof request, including its address and signature.
   * @throws {Error} Throws an error if there is an issue during the creation process or if the transaction fails to confirm.
   */
  async create(props: CreateProofRequestProps, opts?: ConfirmOptions) {
    const authority = this.provider.publicKey
    const [serviceProvider] = this.pda.serviceProvider(props.serviceCode)
    const [policy] = this.pda.policy(serviceProvider, props.policyCode)
    const [proofRequest] = this.pda.proofRequest(policy, authority)

    // TODO: load circuit, get maxPublicInputs
    const maxPublicInputs = props.maxPublicInputs ?? 40

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
          maxPublicInputs,
        },
      },
    )

    try {
      const tx = new Transaction().add(instruction)
      const signature = await this.provider.sendAndConfirm(tx, [], opts)
      return {
        address: proofRequest,
        signature,
      }
    } catch (e: any) {
      throw errorFromCode(e.code) ?? e
    }
  }

  /**
   * Delete a proof request based on the specified properties.
   *
   * @param {DeleteProofRequestProps} props - The properties for deleting the proof request.
   * @param {ConfirmOptions} [opts] - Optional confirmation options for the transaction.
   * @returns {Promise<{signature:string}>} A Promise that resolves to the result of deleting the proof request, including its signature.
   * @throws {Error} Throws an error if there is an issue during the deletion process or if the transaction fails to confirm.
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
   * Change the status of a proof request by providing a new status value.
   * Require admin authority.
   *
   * @param {ChangeStatus} props - The properties for changing the status of the proof request.
   * @param {ConfirmOptions} [opts] - Optional confirmation options for the transaction.
   * @returns {Promise<{signature:string}>} A Promise that resolves to the result of changing the status, including the signature.
   * @throws {Error} Throws an error if there is an issue during the status change process or if the transaction fails to confirm.
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
   * Verify a proof based on the provided properties.
   *
   * @param {VerifyProps} props - The properties for verifying the proof.
   * @returns {Promise<boolean>} A Promise that resolves to a boolean indicating whether the proof is valid (true) or not (false).
   * @throws {Error} Throws an error if there is an issue during the verification process or if the provided proof is not valid.
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
    return Albus.zkp.verifyProof({
      vk,
      proof,
      publicInput,
    })
  }

  /**
   * Perform a full proof generation process based on the provided properties.
   *
   * @param {FullProveProps} props - The properties for the full proof generation process.
   * @returns {Promise<{signature: string}>} A Promise that resolves to the result of the full proof generation, including the signature, proof, public signals, and presentation URI.
   * @throws {Error} Throws an error if there is an issue during any step of the proof generation process.
   */
  async fullProve(props: FullProveProps) {
    const { proofRequest, circuit, policy, serviceProvider }
      = await this.loadFull(props.proofRequest, ['circuit', 'policy', 'serviceProvider'])

    if (!circuit) {
      throw new Error(`Unable to find Circuit account at ${proofRequest.circuit}`)
    }

    if (!policy) {
      throw new Error(`Unable to find Policy account at ${proofRequest.policy}`)
    }

    if (!serviceProvider) {
      throw new Error(`Unable to find Service account at ${proofRequest.serviceProvider}`)
    }

    const trusteePubKeys = await this.service.loadTrusteeKeys(serviceProvider.trustees)

    const credential = await this.credential.load(props.vc, {
      decryptionKey: props.decryptionKey ?? props.userPrivateKey,
    })

    const proofInput = await new ProofInputBuilder(credential)
      .withNow(await getSolanaTimestamp(this.provider.connection))
      .withUserPrivateKey(props.userPrivateKey && Albus.zkp.formatPrivKeyForBabyJub(props.userPrivateKey))
      .withTrusteePublicKey(trusteePubKeys)
      .withCircuit(circuit)
      .withPolicy(policy)
      .build()

    // console.log(proofInput.data)

    try {
      const { proof, publicSignals } = await Albus.zkp.generateProof({
        wasmFile: circuit.wasmUri,
        zkeyFile: circuit.zkeyUri,
        input: proofInput.data,
      })

      const { signatures } = await this.prove({
        proofRequest: props.proofRequest,
        proofRequestData: proofRequest,
        proof,
        publicSignals,
      })

      return { signatures, proof, publicSignals }
    } catch (e: any) {
      console.log(e)
      throw new Error(`Proof generation failed. Circuit constraint violation (${e.message})`)
    }
  }

  /**
   * Prove a proof request by providing the necessary proof and public signals.
   *
   * @param {ProveProps} props - The properties for proving the proof request.
   * @param {ConfirmOptions} [opts] - Optional confirmation options for the transaction.
   * @returns {Promise<{signature:string}>} A Promise that resolves to the result of proving the proof request, including the signature.
   * @throws {Error} Throws an error if there is an issue during the proof process or if the transaction fails to confirm.
   */
  async prove(props: ProveProps, opts?: ConfirmOptions) {
    const authority = this.provider.publicKey
    const proofRequest = props.proofRequestData ?? await this.load(props.proofRequest)

    const proof = await Albus.zkp.encodeProof(props.proof)
    const publicInputs = Albus.zkp.encodePublicSignals(props.publicSignals)

    // 1232 bytes - max tx data size
    const chunkSize = Math.floor((1232 - 256 - 130) / 32)
    const inputChunks = chunk(publicInputs, chunkSize)
    const txs: { tx: Transaction }[] = []

    for (let i = 0; i < inputChunks.length; i++) {
      const inputs = inputChunks[i]!
      const isFirst = i === 0
      const isLast = inputChunks.length - 1

      const tx = new Transaction()

      tx.add(
        createProveInstruction(
          {
            proofRequest: new PublicKey(props.proofRequest),
            circuit: proofRequest.circuit,
            policy: proofRequest.policy,
            authority,
          },
          {
            data: {
              reset: isFirst,
              publicInputs: inputs,
              proof: isLast ? proof : null,
            },
          },
        ),
      )

      if (isLast) {
        tx.add(ComputeBudgetProgram.setComputeUnitLimit({ units: 200000 }))
      }

      txs.push({ tx })
    }

    try {
      const signatures = await this.provider.sendAll(txs, opts)
      // const tx = new Transaction()
      //   .add(ComputeBudgetProgram.setComputeUnitLimit({ units: 200000 }))
      //   .add(instruction)
      // const signature = await this.provider.sendAndConfirm(tx, [], opts)
      return { signatures }
    } catch (e: any) {
      // console.log(e)
      throw errorFromCode(e.code) ?? e
    }
  }

  /**
   * Validate a proof request to ensure it meets specific criteria.
   *
   * @param {ProofRequest} req - The proof request to validate.
   * @throws {Error} Throws an error if the proof request fails validation based on specified criteria.
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

interface LoadFullResult {
  proofRequest: ProofRequest
  circuit?: Circuit
  policy?: Policy
  serviceProvider?: ServiceProvider
}

export interface CreateProofRequestProps {
  serviceCode: string
  policyCode: string
  expiresIn?: number
  maxPublicInputs?: number
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
  userPrivateKey?: Uint8Array
  // Credential decryption key
  decryptionKey?: PrivateKey
}

export interface VerifyProps {
  proofRequest: PublicKeyInitData
}

export interface ProveProps {
  proofRequest: PublicKeyInitData
  proofRequestData?: ProofRequest
  proof: ProofData
  publicSignals: (string | number | bigint)[]
}

export interface ChangeStatus {
  proofRequest: PublicKeyInitData
  status: ProofRequestStatus
}
