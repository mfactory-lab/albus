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

import * as Albus from '@albus-finance/core'
import type {
  Commitment,
  ConfirmOptions,
  GetMultipleAccountsConfig,
  PublicKeyInitData,
} from '@solana/web3.js'
import { ComputeBudgetProgram, PublicKey, Transaction } from '@solana/web3.js'
import chunk from 'lodash/chunk'
import type { TxBuilder } from './utils'
import { BaseManager } from './base'
import type {
  ProofData,
  ProofRequestStatus,
} from './generated'
import {
  Circuit,
  Issuer,
  Policy,
  ProofRequest,
  ServiceProvider,
  createCreateProofRequestInstruction,
  createDeleteProofRequestInstruction,
  createProveProofRequestInstruction,
  createUpdateProofRequestInstruction,
  createVerifyProofRequestInstruction,
  proofRequestDiscriminator,
} from './generated'
import { KnownSignals } from './types'
import { ProofInputBuilder, getSignals, getSolanaTimestamp } from './utils'

export class ProofRequestManager extends BaseManager {
  private get service() {
    return this.client.service
  }

  private get circuit() {
    return this.client.circuit
  }

  private get credential() {
    return this.client.credential
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
            case 'issuer':
              result.issuer = Issuer.fromAccountInfo(accountInfo)[0]
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
    const builder = ProofRequest.gpaBuilder(this.programId)
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
    const txBuilder = props.txBuilder ?? this.txBuilder

    const ix = createCreateProofRequestInstruction(
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
      this.programId,
    )

    txBuilder.addInstruction(ix)

    let signature: string | undefined

    if (!props.txBuilder) {
      signature = await txBuilder.sendAndConfirm(opts)
    }

    return {
      address: proofRequest,
      signature,
    }
  }

  /**
   * Delete a proof request based on the specified properties.
   */
  async delete(props: DeleteProofRequestProps, opts?: ConfirmOptions) {
    const authority = this.provider.publicKey
    const ix = createDeleteProofRequestInstruction({
      proofRequest: new PublicKey(props.proofRequest),
      authority,
    }, this.programId)

    const signature = await this.txBuilder.addInstruction(ix).sendAndConfirm(opts)

    return { signature }
  }

  /**
   * Change the status of a proof request by providing a new status value.
   * Require admin authority.
   */
  async changeStatus(props: ChangeStatus, opts?: ConfirmOptions) {
    const ix = createUpdateProofRequestInstruction(
      {
        proofRequest: new PublicKey(props.proofRequest),
        authority: this.provider.publicKey,
      },
      {
        data: {
          status: props.status,
        },
      },
      this.programId,
    )

    const signature = await this.txBuilder.addInstruction(ix).sendAndConfirm(opts)

    return { signature }
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

  /**
   * Decrypts data using the provided secret and signals.
   */
  decryptData(props: { secret: bigint, signals: Record<string, any> }) {
    const { secret, signals } = props
    const nonce = signals.timestamp as bigint
    const encryptedData = (signals.encryptedData ?? []) as bigint[]

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
        verificationMethod: `#keys-0`,
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
    const proofRequest = new PublicKey(props.proofRequest)
    const circuit = new PublicKey(props.circuit)
    const policy = new PublicKey(props.policy)

    const proof = Albus.zkp.encodeProof(props.proof)
    const publicInputs = Albus.zkp.encodePublicSignals(props.publicSignals)

    // extending public inputs, length more than 19 does not fit into one transaction
    // a transaction's maximum size is 1,232 bytes
    const inputsLimit = { withProof: 19, withoutProof: 28 }

    this.trace('prove', 'init', { proof, publicInputs })

    const txBuilder = props.txBuilder ?? this.txBuilder

    if (publicInputs.length > inputsLimit.withProof) {
      const inputChunks = chunk(publicInputs.slice(0, -inputsLimit.withProof), inputsLimit.withoutProof)
      for (let i = 0; i < inputChunks.length; i++) {
        txBuilder.addTransaction(
          new Transaction().add(createProveProofRequestInstruction(
            {
              proofRequest,
              circuit,
              policy,
              authority,
            },
            {
              data: {
                reset: i === 0,
                publicInputs: inputChunks[i],
                proof: null,
              },
            },
            this.programId,
          )),
        )
      }
    }

    txBuilder.addTransaction(
      new Transaction().add(createProveProofRequestInstruction(
        {
          proofRequest,
          circuit,
          policy,
          issuer: props.issuer,
          authority,
        },
        {
          data: {
            reset: publicInputs.length <= inputsLimit.withProof,
            publicInputs: publicInputs.slice(-inputsLimit.withProof),
            proof,
          },
        },
        this.programId,
      )),
    )

    if (props.verify) {
      this.trace('prove', 'createVerifyProofRequestInstruction (setComputeUnitLimit: 400_000)')
      txBuilder.addTransaction(
        new Transaction()
          .add(ComputeBudgetProgram.setComputeUnitLimit({ units: 400_000 }))
          .add(createVerifyProofRequestInstruction({
            proofRequest,
            circuit,
            authority,
          }, this.programId)),
      )
    }

    let signatures: string[] = []
    if (!props.txBuilder) {
      this.trace('prove', `sending ${txBuilder.txs.length} transactions...`)
      signatures = await txBuilder.sendAll(opts)
      this.trace('prove', { signatures })
    }

    return { signatures }
  }

  /**
   * Perform a full proof generation process.
   */
  async fullProveInternal(props: FullProveInternalProps) {
    const accountInfos = await this.provider.connection.getMultipleAccountsInfo([
      new PublicKey(props.serviceProvider),
      new PublicKey(props.circuit),
      new PublicKey(props.policy),
    ])

    if (!accountInfos[0]) {
      throw new Error(`Unable to find Service account at ${props.serviceProvider}`)
    }
    if (!accountInfos[1]) {
      throw new Error(`Unable to find Circuit account at ${props.circuit}`)
    }
    if (!accountInfos[2]) {
      throw new Error(`Unable to find Policy account at ${props.policy}`)
    }

    const serviceProvider = ServiceProvider.fromAccountInfo(accountInfos[0])[0]
    const circuit = Circuit.fromAccountInfo(accountInfos[1])[0]
    const policy = Policy.fromAccountInfo(accountInfos[2])[0]

    const credential = await this.credential.load(props.vc, {
      decryptionKey: props.decryptionKey ?? props.userPrivateKey,
    })

    const proofInput = await new ProofInputBuilder(credential)
      .withUserPrivateKey(props.userPrivateKey)
      .withCircuit(circuit)
      .withPolicy(policy)
      .withTimestampLoader(() => this.getTimestamp())
      .withTrusteeLoader(async () => {
        this.trace('fullProve', `loading trustee accounts...`, serviceProvider.trustees.map(t => t.toBase58()))
        const keys = (await this.service.loadTrusteeKeys(serviceProvider.trustees))
          .filter(p => p !== null) as [bigint, bigint][]
        for (const key of keys) {
          this.trace('fullProve', 'trustee sharedKey', Albus.zkp.generateEcdhSharedKey(props.userPrivateKey, key))
        }
        return keys
      })
      .build()

    // try to find a valid issuer by credential proof signer
    let issuer: PublicKey | undefined
    if (proofInput.data[KnownSignals.IssuerPublicKey]) {
      this.trace('fullProve', `trying to find an issuer...`)
      issuer = (await this.client.issuer.loadByZkPubkey(
        proofInput.data[KnownSignals.IssuerPublicKey],
        true,
      )).pubkey
      this.trace('fullProve', `found issuer ${issuer}`)
    }

    try {
      const proofData = {
        wasmFile: props.wasmUri ?? circuit.wasmUri,
        zkeyFile: props.zkeyUri ?? circuit.zkeyUri,
        input: proofInput.data,
      }

      this.trace('fullProve', 'proving...', proofData)
      const { proof, publicSignals } = await Albus.zkp.generateProof(proofData)

      this.trace('fullProve', 'sending transaction...')
      const { signatures } = await this.prove({
        proofRequest: props.proofRequest,
        circuit: props.circuit,
        policy: props.policy,
        verify: props.verify ?? true,
        proof,
        issuer,
        // @ts-expect-error readonly
        publicSignals,
        txBuilder: props.txBuilder,
      })

      this.trace('fullProve', 'prove result', { signatures })

      return { signatures, proof, publicSignals }
    } catch (e: any) {
      if (props.throwOnError) {
        throw e
      }
      this.trace('fullProve', e)
      throw new Error(`Proof generation failed. Circuit constraint violation (${e.message})`)
    }
  }

  /**
   * Perform a full proof generation process for provided proof request.
   */
  async fullProve(props: FullProveProps) {
    const proofRequest = await this.load(props.proofRequest)
    return this.fullProveInternal({
      serviceProvider: proofRequest.serviceProvider,
      circuit: proofRequest.circuit,
      policy: proofRequest.policy,
      ...props,
    })
  }

  async getTimestamp() {
    return getSolanaTimestamp(this.provider.connection)
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

type LoadFullResult = {
  proofRequest: ProofRequest
  circuit?: Circuit
  policy?: Policy
  issuer?: Issuer
  serviceProvider?: ServiceProvider
}

export type CreateProofRequestProps = {
  serviceCode: string
  policyCode: string
  expiresIn?: number
  maxPublicInputs?: number
  txBuilder?: TxBuilder
}

export type DeleteProofRequestProps = {
  proofRequest: PublicKeyInitData
}

export type FindProofRequestProps = {
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

export type VerifyProps = {
  proofRequest: PublicKeyInitData | ProofRequest
}

export type FullProveProps = {
  proofRequest: PublicKeyInitData
  vc: PublicKeyInitData
  userPrivateKey: Uint8Array
  // Credential decryption key
  decryptionKey?: Uint8Array
  // On-chain verification. Default: true
  verify?: boolean
  throwOnError?: boolean
  txBuilder?: TxBuilder
  // for tests only
  // eslint-disable-next-line node/prefer-global/buffer
  wasmUri?: Buffer | string
  // for tests only
  // eslint-disable-next-line node/prefer-global/buffer
  zkeyUri?: Buffer | string
}

export type FullProveInternalProps = {
  serviceProvider: PublicKeyInitData
  circuit: PublicKeyInitData
  policy: PublicKeyInitData
} & FullProveProps

export type ProveProps = {
  proofRequest: PublicKeyInitData
  circuit: PublicKeyInitData
  policy: PublicKeyInitData
  issuer?: PublicKey
  proof: ProofData
  publicSignals: (string | number | bigint)[]
  verify: boolean
  txBuilder?: TxBuilder
}

export type ChangeStatus = {
  proofRequest: PublicKeyInitData
  status: ProofRequestStatus
}
type GenerateVerifiablePresentationProps = {
  proofRequest: PublicKeyInitData
  userPrivateKey: Uint8Array
}
