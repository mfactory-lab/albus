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

import type { AnchorProvider } from '@coral-xyz/anchor'
import * as Albus from '@mfactory-lab/albus-core'
import type {
  Commitment,
  ConfirmOptions,
  GetMultipleAccountsConfig,
  PublicKeyInitData,
} from '@solana/web3.js'
import { Keypair, PublicKey, Transaction } from '@solana/web3.js'
import type {
  InvestigationStatus,
  ProofRequest,
  RevelationStatus,
} from './generated'
import {
  InvestigationRequest,
  InvestigationRequestShare,
  createCreateInvestigationRequestInstruction,
  createRevealSecretShareInstruction,
  errorFromCode,
  investigationRequestDiscriminator,
  investigationRequestShareDiscriminator,
} from './generated'
import type { PdaManager } from './pda'
import type { ProofRequestManager } from './proofRequestManager'
import type { ServiceManager } from './serviceManager'
import { getSignals } from './utils'

export class InvestigationManager {
  constructor(
    readonly provider: AnchorProvider,
    readonly proofRequest: ProofRequestManager,
    readonly service: ServiceManager,
    readonly pda: PdaManager,
  ) {
  }

  /**
   * Load {@link InvestigationRequest} by {@link addr}
   * @param addr
   * @param commitment
   */
  async load(addr: PublicKeyInitData | InvestigationRequest, commitment?: Commitment) {
    if (addr instanceof InvestigationRequest) {
      return addr
    }
    return InvestigationRequest.fromAccountAddress(this.provider.connection, new PublicKey(addr), commitment)
  }

  /**
   * Load multiple {@link InvestigationRequest}s
   * @param addrs
   * @param commitmentOrConfig
   */
  async loadMultiple(addrs: PublicKey[], commitmentOrConfig?: Commitment | GetMultipleAccountsConfig) {
    return (await this.provider.connection.getMultipleAccountsInfo(addrs, commitmentOrConfig))
      .filter(acc => acc !== null)
      .map(acc => InvestigationRequest.fromAccountInfo(acc!)[0])
  }

  /**
   * Load {@link InvestigationRequestShare} by {@link addr}
   * @param addr
   * @param commitment
   */
  async loadShare(addr: PublicKeyInitData | InvestigationRequestShare, commitment?: Commitment) {
    if (addr instanceof InvestigationRequestShare) {
      return addr
    }
    return InvestigationRequestShare.fromAccountAddress(this.provider.connection, new PublicKey(addr), commitment)
  }

  /**
   * Load multiple {@link InvestigationRequestShare}s
   * @param addrs
   * @param commitmentOrConfig
   */
  async loadMultipleShares(addrs: PublicKey[], commitmentOrConfig?: Commitment | GetMultipleAccountsConfig) {
    return (await this.provider.connection.getMultipleAccountsInfo(addrs, commitmentOrConfig))
      .filter(acc => acc !== null)
      .map(acc => InvestigationRequestShare.fromAccountInfo(acc!)[0])
  }

  /**
   * Find {@link InvestigationRequest}
   * @param props
   */
  async find(props: FindInvestigationProps = {}) {
    const builder = InvestigationRequest.gpaBuilder()
      .addFilter('accountDiscriminator', investigationRequestDiscriminator)

    if (props.noData) {
      builder.config.dataSlice = {
        offset: 0,
        length: 0,
      }
    }

    if (props.status) {
      builder.addFilter('status', props.status)
    }

    if (props.authority) {
      builder.addFilter('authority', new PublicKey(props.authority))
    }

    if (props.serviceProvider) {
      builder.addFilter('serviceProvider', new PublicKey(props.serviceProvider))
    }

    if (props.proofRequest) {
      builder.addFilter('proofRequest', new PublicKey(props.proofRequest))
    }

    if (props.proofRequestOwner) {
      builder.addFilter('proofRequestOwner', new PublicKey(props.proofRequestOwner))
    }

    return (await builder.run(this.provider.connection))
      .map((acc) => {
        return {
          pubkey: acc.pubkey,
          data: props.noData ? null : InvestigationRequest.fromAccountInfo(acc.account)[0],
        }
      })
  }

  /**
   * Find {@link InvestigationRequestShare}
   * @param props
   */
  async findShares(props: FindInvestigationShareProps = {}) {
    const builder = InvestigationRequestShare.gpaBuilder()
      .addFilter('accountDiscriminator', investigationRequestShareDiscriminator)

    if (props.noData) {
      builder.config.dataSlice = {
        offset: 0,
        length: 0,
      }
    }

    if (props.investigationRequest) {
      builder.addFilter('investigationRequest', new PublicKey(props.investigationRequest))
    }

    if (props.proofRequestOwner) {
      builder.addFilter('proofRequestOwner', new PublicKey(props.proofRequestOwner))
    }

    if (props.trustee) {
      builder.addFilter('trustee', new PublicKey(props.trustee))
    }

    if (props.status) {
      builder.addFilter('status', props.status)
    }

    if (props.index) {
      builder.addFilter('index', props.index)
    }

    return (await builder.run(this.provider.connection))
      .map((acc) => {
        return {
          pubkey: acc.pubkey,
          data: props.noData ? null : InvestigationRequestShare.fromAccountInfo(acc.account)[0],
        }
      })
  }

  /**
   * Create new {@link InvestigationRequest}
   * @param props
   * @param opts
   */
  async create(props: CreateInvestigationProps, opts?: ConfirmOptions) {
    const authority = this.provider.publicKey

    const proofRequest = await this.proofRequest.load(props.proofRequest)

    if (!proofRequest.proof) {
      throw new Error('Proof request is not proved yet')
    }

    const { serviceProvider, circuit } = await this.proofRequest.loadFull(
      proofRequest,
      ['serviceProvider', 'circuit'],
    )

    if (!serviceProvider) {
      throw new Error(`Unable to find Service account at ${proofRequest.serviceProvider}`)
    }

    const signals = getSignals(
      [...circuit?.outputs ?? [], ...circuit?.publicSignals ?? []],
      proofRequest.publicInputs.map(Albus.crypto.utils.bytesToBigInt),
    )

    console.log('signals.trusteePublicKey', (signals.trusteePublicKey as bigint[][] ?? []).length)

    const selectedTrustees = (signals.trusteePublicKey as bigint[][] ?? [])
      .map(p => this.pda.trustee(Albus.zkp.packPubkey(p))[0])

    const [investigationRequest] = this.pda.investigationRequest(props.proofRequest, authority)

    const ix = createCreateInvestigationRequestInstruction({
      investigationRequest,
      proofRequest: new PublicKey(props.proofRequest),
      serviceProvider: proofRequest.serviceProvider,
      authority,
      anchorRemainingAccounts: selectedTrustees.length > 0
        ? selectedTrustees.map(pubkey => ({
          pubkey: this.pda.investigationRequestShare(investigationRequest, pubkey)[0],
          isSigner: false,
          isWritable: true,
        }))
        : undefined,
    }, {
      data: {
        encryptionKey: props.encryptionKey ?? authority,
        trustees: selectedTrustees,
      },
    })

    try {
      const tx = new Transaction().add(ix)
      const signature = await this.provider.sendAndConfirm(tx, [], opts)
      return { address: investigationRequest, selectedTrustees, signature }
    } catch (e: any) {
      throw errorFromCode(e.code) ?? e
    }
  }

  /**
   * Reveal a secret share for {@link InvestigationRequest}
   * @param props
   * @param opts
   */
  async revealShare(props: RevealShareProps, opts?: ConfirmOptions) {
    if (Number(props.index) < 1) {
      throw new Error('Invalid index. Must be greater than or equal to 1.')
    }

    const authority = this.provider.publicKey

    const investigationRequest = await this.load(props.investigationRequest)
    const { proofRequest, circuit } = await this.proofRequest.loadFull(investigationRequest.proofRequest, ['circuit'])

    if (!circuit) {
      throw new Error(`Unable to find Circuit account at ${proofRequest.circuit}`)
    }

    const signals = getSignals(
      [...circuit?.outputs ?? [], ...circuit?.publicSignals ?? []],
      proofRequest.publicInputs.map(Albus.crypto.utils.bytesToBigInt),
    )

    const trusteePubkey = (signals.trusteePublicKey as bigint[][] ?? [])[props.index - 1]
    if (!trusteePubkey) {
      throw new Error(`Unable to find a trustee pubkey with index ${props.index - 1}`)
    }

    const trustee = this.pda.trustee(Albus.zkp.packPubkey(trusteePubkey))[0]
    const [investigationRequestShare] = this.pda.investigationRequestShare(props.investigationRequest, trustee)

    const encryptedShare = signals.encryptedShare?.[props.index - 1]
    if (!encryptedShare) {
      throw new Error(`Unable to find an encrypted share with index ${props.index - 1}`)
    }

    const userPublicKey = signals.userPublicKey as [bigint, bigint]
    const sharedKey = Albus.zkp.generateEcdhSharedKey(props.encryptionKey, userPublicKey)
    const secretShare = Albus.crypto.Poseidon.decrypt(encryptedShare, sharedKey, 1, signals.currentDate as bigint)
    const newEncryptedShare = await Albus.crypto.XC20P.encryptBytes(
      Albus.crypto.utils.bigintToBytes(secretShare[0]),
      investigationRequest.encryptionKey,
    )

    // console.log('userPublicKey', userPublicKey)
    // console.log('sharedKey', sharedKey)
    // console.log('secretShare', secretShare)
    // console.log('encryptionKey', investigationRequest.encryptionKey)
    // console.log('newEncryptedShare', newEncryptedShare.length, newEncryptedShare)

    const ix = createRevealSecretShareInstruction({
      investigationRequestShare,
      investigationRequest: new PublicKey(props.investigationRequest),
      trustee,
      authority,
    }, {
      data: {
        index: props.index,
        share: newEncryptedShare,
      },
    })

    try {
      const tx = new Transaction().add(ix)
      const signature = await this.provider.sendAndConfirm(tx, [], opts)
      return { address: investigationRequest, userPublicKey, secretShare, signature }
    } catch (e: any) {
      throw errorFromCode(e.code) ?? e
    }
  }

  /**
   * Decrypt investigation data
   * @param props
   */
  async decryptData(props: DecryptDataProps) {
    const investigationRequest = await this.load(props.investigationRequest)
    const shares = await this.findShares({ investigationRequest: props.investigationRequest })

    if (shares.length < investigationRequest.requiredShareCount) {
      throw new Error('Invalid shares count')
    }

    const encKeypair = Keypair.fromSecretKey(props.encryptionKey)
    if (encKeypair.publicKey.toString() !== investigationRequest.encryptionKey.toString()) {
      throw new Error('Invalid encryption key')
    }

    const decryptedShares: [number, bigint][] = []
    for (const { data } of shares) {
      const encBytes = Uint8Array.from(data?.share ?? [])
      if (encBytes.length === 0) {
        continue
      }
      const shareBytes = await Albus.crypto.XC20P.decryptBytes(encBytes, encKeypair.secretKey)
      const share = Albus.crypto.utils.bytesToBigInt(shareBytes)
      decryptedShares.push([data?.index ?? 0, share])
    }

    const decryptedSecret = Albus.crypto.reconstructShamirSecret(Albus.crypto.babyJub.F, investigationRequest.requiredShareCount, decryptedShares)

    // console.log('decryptedSecret', decryptedSecret)

    const { proofRequest, circuit } = await this.proofRequest.loadFull(investigationRequest.proofRequest, ['circuit'])

    if (!circuit) {
      throw new Error(`Unable to find Circuit account at ${proofRequest.circuit}`)
    }

    const signals = getSignals(
      [...circuit?.outputs ?? [], ...circuit?.publicSignals ?? []],
      proofRequest.publicInputs.map(Albus.crypto.utils.bytesToBigInt),
    )

    const nonce = signals.currentDate as bigint
    const encryptedData = (signals.encryptedData ?? []) as bigint[]
    // console.log('encryptedData', encryptedData)

    const data = Albus.crypto.Poseidon.decrypt(encryptedData, [decryptedSecret, decryptedSecret], 1, nonce)

    return {
      claims: data,
      birthDateProof: signals.birthDateProof,
      birthDateKey: signals.birthDateKey,
      credentialRoot: signals.credentialRoot,
      issuerPk: signals.issuerPk,
      issuerSignature: signals.issuerSignature,
      userPublicKey: signals.userPublicKey,
    }
  }
}

export interface CreateInvestigationProps {
  proofRequest: PublicKeyInitData | ProofRequest
  encryptionKey?: PublicKey
}

export interface FindInvestigationProps {
  authority?: PublicKeyInitData
  serviceProvider?: PublicKeyInitData
  proofRequest?: PublicKeyInitData
  proofRequestOwner?: PublicKeyInitData
  trustee?: PublicKeyInitData
  status?: InvestigationStatus
  noData?: boolean
}

export interface FindInvestigationShareProps {
  trustee?: PublicKeyInitData
  proofRequestOwner?: PublicKeyInitData
  investigationRequest?: PublicKeyInitData
  status?: RevelationStatus
  index?: number
  noData?: boolean
}

export interface RevealShareProps {
  investigationRequest: PublicKeyInitData
  encryptionKey: Uint8Array
  index: number
}

export interface DecryptDataProps {
  investigationRequest: PublicKeyInitData
  encryptionKey: Uint8Array
}
