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
import chunk from 'lodash/chunk'
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
  createDeleteProofRequestInstruction, createProveProofRequestInstruction,
  createUpdateProofRequestInstruction, createVerifyProofRequestInstruction, errorFromCode, proofRequestDiscriminator,
} from './generated'
import type { PdaManager } from './pda'
import type { ServiceManager } from './serviceManager'
import { ProofInputBuilder, getSignals, getSolanaTimestamp } from './utils'

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
   */
  async load(addr: PublicKeyInitData | ProofRequest, commitment?: Commitment) {
    if (addr instanceof ProofRequest) {
      return addr
    }
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
   */
  async loadFull(
    addr: PublicKeyInitData | ProofRequest,
    accounts: Array<Exclude<keyof LoadFullResult, 'proofRequest'>> = [],
    commitmentOrConfig?: Commitment | GetMultipleAccountsConfig,
  ) {
    const proofRequest = await this.load(addr)
    const pubKeys = accounts.map(key => proofRequest[key])
    const result: LoadFullResult = { proofRequest }
    if (pubKeys.length > 0) {
      const accountInfos = await this.provider.connection.getMultipleAccountsInfo(pubKeys, commitmentOrConfig)
      for (let i = 0; i < accounts.length; i++) {
        const prop = accounts[i]!
        const accountInfo = accountInfos[i]
        if (accountInfo) {
          switch (prop) {
            case 'circuit':
              result.circuit = Circuit.fromAccountInfo(accountInfo)[0]
              break
            case 'policy':
              result.policy = Policy.fromAccountInfo(accountInfo)[0]
              break
            case 'serviceProvider':
              result.serviceProvider = ServiceProvider.fromAccountInfo(accountInfo)[0]
              break
          }
        }
      }
    }
    return result
  }

  /**
   * Find proof requests based on specified criteria.
   */
  async find(props: FindProofRequestProps = {}) {
    const builder = ProofRequest.gpaBuilder()
      .addFilter('accountDiscriminator', proofRequestDiscriminator)

    if (props.noData) {
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

    return (await builder.run(this.provider.connection))
      .map(acc => ({
        pubkey: acc.pubkey,
        data: props.noData ? null : ProofRequest.fromAccountInfo(acc.account)[0],
      }))
  }

  /**
   * Create a new proof request with the specified properties.
   */
  async create(props: CreateProofRequestProps, opts?: ConfirmOptions) {
    const authority = this.provider.publicKey
    const [serviceProvider] = this.pda.serviceProvider(props.serviceCode)
    const [policy] = this.pda.policy(serviceProvider, props.policyCode)
    const [proofRequest] = this.pda.proofRequest(policy, authority)

    // TODO: load circuit, get maxPublicInputs
    const maxPublicInputs = props.maxPublicInputs ?? 50

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
   */
  async changeStatus(props: ChangeStatus, opts?: ConfirmOptions) {
    const instruction = createUpdateProofRequestInstruction(
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
   */
  async verify(props: VerifyProps): Promise<boolean> {
    const proofRequest = await this.load(props.proofRequest)
    if (!proofRequest.proof) {
      throw new Error('Unable to verify the request, probably it\'s not proved')
    }
    const circuit = await this.circuit.load(proofRequest.circuit)
    const vk = Albus.zkp.decodeVerifyingKey(circuit.vk)
    const proof = Albus.zkp.decodeProof(proofRequest.proof)
    const publicInput = Albus.zkp.decodePublicSignals(proofRequest.publicInputs)
    return Albus.zkp.verifyProof({ vk, proof, publicInput })
  }

  decryptData(props: { secret: bigint; signals: Record<string, any> }) {
    const { secret, signals } = props
    const nonce = signals.timestamp as bigint
    const encryptedData = (signals.encryptedData ?? []) as bigint[]
    // console.log('encryptedData', encryptedData)

    const data = Albus.crypto.Poseidon.decrypt(encryptedData, [secret, secret], 1, nonce)

    return {
      claims: {
        birthDate: {
          proof: signals.birthDateProof,
          key: signals.birthDateKey,
          value: data[0],
        },
      },
      credentialRoot: signals.credentialRoot,
      issuerPk: signals.issuerPk, // [Ax, Ay]
      issuerSignature: signals.issuerSignature, // [R8x, R8y, S]
      userPublicKey: signals.userPublicKey,
    }
  }

  async generateVerifiablePresentation(props: GenerateVerifiablePresentationProps) {
    const { proofRequest, circuit } = await this.loadFull(props.proofRequest, ['circuit'])

    if (!circuit) {
      throw new Error(`Unable to find Circuit account at ${proofRequest.circuit}`)
    }

    const signals = getSignals(
      [...circuit?.outputs ?? [], ...circuit?.publicSignals ?? []],
      proofRequest.publicInputs.map(Albus.crypto.utils.bytesToBigInt),
    )

    const secret = Albus.crypto.Poseidon.hash([
      Albus.zkp.formatPrivKeyForBabyJub(props.userPrivateKey),
      signals.credentialRoot as bigint,
      signals.timestamp as bigint,
    ])

    const data = this.decryptData({ secret, signals })

    const vc = await Albus.credential.createVerifiableCredential({
      birthDate: data.claims.birthDate.value,
      customProof: {
        type: 'BJJSignature2021',
        created: Number(new Date()),
        // TODO: fixme
        verificationMethod: 'did:web:albus.finance#keys-0',
        rootHash: data.credentialRoot,
        proofValue: {
          ax: data.issuerPk[0],
          ay: data.issuerPk[1],
          r8x: data.issuerSignature[0],
          r8y: data.issuerSignature[1],
          s: data.issuerSignature[2],
        },
        proofPurpose: 'assertionMethod',
      },
    })

    return Albus.credential.createVerifiablePresentation({
      holderSecretKey: props.userPrivateKey,
      credentials: [vc],
    })
  }

  /**
   * Prove a proof request by providing the necessary proof and public signals.
   */
  async prove(props: ProveProps, opts?: ConfirmOptions) {
    const authority = this.provider.publicKey
    const proofRequest = props.proofRequestData ?? await this.load(props.proofRequest)

    const proof = Albus.zkp.encodeProof(props.proof)
    const publicInputs = Albus.zkp.encodePublicSignals(props.publicSignals)

    const txs: { tx: Transaction }[] = []

    txs.push({
      tx: new Transaction().add(
        createProveProofRequestInstruction(
          {
            proofRequest: new PublicKey(props.proofRequest),
            circuit: proofRequest.circuit,
            policy: proofRequest.policy,
            authority,
          },
          {
            data: {
              reset: true,
              publicInputs: publicInputs.slice(0, 20),
              proof,
            },
          },
        ),
      ),
    })

    // extend public inputs if needed
    if (publicInputs.length > 20) {
      const inputChunks = chunk(publicInputs.slice(20), 28)
      for (let i = 0; i < inputChunks.length; i++) {
        const inputs = inputChunks[i]!
        txs.push({
          tx: new Transaction().add(
            createProveProofRequestInstruction(
              {
                proofRequest: new PublicKey(props.proofRequest),
                circuit: proofRequest.circuit,
                policy: proofRequest.policy,
                authority,
              },
              {
                data: {
                  reset: false,
                  publicInputs: inputs,
                  proof: null,
                },
              },
            ),
          ),
        })
      }
    }

    if (props.verify) {
      const tx = new Transaction()
        .add(ComputeBudgetProgram.setComputeUnitLimit({ units: 400_000 }))
        .add(createVerifyProofRequestInstruction({
          proofRequest: new PublicKey(props.proofRequest),
          circuit: proofRequest.circuit,
          authority,
        }))
      txs.push({ tx })
    }

    try {
      const signatures = await this.provider.sendAll(txs, opts)
      return { signatures }
    } catch (e: any) {
      // console.log(e)
      throw errorFromCode(e.code) ?? e
    }
  }

  /**
   * Perform a full proof generation process based on the provided properties.
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

    if (serviceProvider.trustees.length < 3) {
      throw new Error('Service account does not contains required trustee count')
    }

    const trusteePubKeys = (await this.service.loadTrusteeKeys(serviceProvider.trustees))
      .filter(p => p !== null) as [bigint, bigint][]

    const credential = await this.credential.load(props.vc, {
      decryptionKey: props.decryptionKey ?? props.userPrivateKey,
    })

    const proofInput = await new ProofInputBuilder(credential)
      .withTimestamp(await getSolanaTimestamp(this.provider.connection))
      .withUserPrivateKey(Albus.zkp.formatPrivKeyForBabyJub(props.userPrivateKey))
      .withTrusteePublicKey(trusteePubKeys)
      .withCircuit(circuit)
      .withPolicy(policy)
      .build()

    console.log(proofInput.data)

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
        // @ts-expect-error readonly
        publicSignals,
        verify: true,
      })

      return { signatures, proof, publicSignals }
    } catch (e: any) {
      console.log(e)
      throw new Error(`Proof generation failed. Circuit constraint violation (${e.message})`)
    }
  }

  /**
   * Validate a proof request to ensure it meets specific criteria.
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
  noData?: boolean
}

export interface FullProveProps {
  proofRequest: PublicKeyInitData
  vc: PublicKeyInitData
  userPrivateKey: Uint8Array
  // Credential decryption key
  decryptionKey?: Uint8Array
}

export interface VerifyProps {
  proofRequest: PublicKeyInitData | ProofRequest
}

export interface ProveProps {
  proofRequest: PublicKeyInitData
  proofRequestData?: ProofRequest
  proof: ProofData
  publicSignals: (string | number | bigint)[]
  verify: boolean
}

export interface ChangeStatus {
  proofRequest: PublicKeyInitData
  status: ProofRequestStatus
}
interface GenerateVerifiablePresentationProps {
  proofRequest: PublicKeyInitData
  userPrivateKey: Uint8Array
}
