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
import { Keypair, PublicKey } from '@solana/web3.js'
import { BaseManager } from './base'
import type {
  InvestigationStatus,
  ProofRequest,
  RevelationStatus,
} from './generated'
import {
  InvestigationRequest,
  InvestigationRequestShare,
  createCreateInvestigationRequestInstruction,
  createDeleteInvestigationRequestInstruction,
  createRevealSecretShareInstruction,
  errorFromCode,
  investigationRequestDiscriminator,
  investigationRequestShareDiscriminator,
} from './generated'
import { getSignals } from './utils'

export class InvestigationManager extends BaseManager {
  private get proofRequest() {
    return this.client.proofRequest
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
    const builder = InvestigationRequest.gpaBuilder(this.programId)
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
    const builder = InvestigationRequestShare.gpaBuilder(this.programId)
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

  async createIx(props: CreateInvestigationProps) {
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

    // if (!circuit) {
    //   throw new Error(`Unable to find Circuit account at ${proofRequest.circuit}`)
    // }

    const signals = getSignals(
      [...circuit?.outputs ?? [], ...circuit?.publicSignals ?? []],
      proofRequest.publicInputs.map(Albus.crypto.utils.bytesToBigInt),
    )

    if (signals.encryptedShare === undefined) {
      throw new Error(`The circuit ${circuit?.code} does not support data encryption...`)
    }

    const selectedTrustees = (signals.trusteePublicKey as bigint[][] ?? [])
      .map(p => this.pda.trustee(Albus.zkp.packPubkey(p))[0])

    const [address] = this.pda.investigationRequest(props.proofRequest, authority)

    this.trace('create', `investigationRequest: ${address}`)
    this.trace('create', `selectedTrustees`, selectedTrustees.map(p => p.toString()))

    const ix = createCreateInvestigationRequestInstruction({
      investigationRequest: address,
      proofRequest: new PublicKey(props.proofRequest),
      serviceProvider: proofRequest.serviceProvider,
      authority,
      anchorRemainingAccounts: selectedTrustees.length > 0
        ? selectedTrustees.map(pubkey => ({
          pubkey: this.pda.investigationRequestShare(address, pubkey)[0],
          isSigner: false,
          isWritable: true,
        }))
        : undefined,
    }, {
      data: {
        encryptionKey: props.encryptionKey ?? authority,
        trustees: selectedTrustees,
      },
    }, this.programId)

    return {
      address,
      selectedTrustees,
      instructions: [ix],
    }
  }

  /**
   * Create new {@link InvestigationRequest}
   */
  async create(props: CreateInvestigationProps, opts?: ConfirmOptions) {
    const { address, selectedTrustees, instructions } = await this.createIx(props)
    try {
      const signature = await this.txBuilder
        .addInstruction(...instructions)
        .sendAndConfirm(opts)
      return { address, selectedTrustees, signature }
    } catch (e: any) {
      throw errorFromCode(e.code) ?? e
    }
  }

  async deleteIx(props: DeleteInvestigationProps) {
    const authority = this.provider.publicKey
    const investigationRequestAddr = new PublicKey(props.investigationRequest)
    const investigationRequest = await this.load(investigationRequestAddr)

    const ix = createDeleteInvestigationRequestInstruction({
      investigationRequest: new PublicKey(props.investigationRequest),
      anchorRemainingAccounts: investigationRequest.trustees.map(pubkey => ({
        pubkey: this.pda.investigationRequestShare(investigationRequestAddr, pubkey)[0],
        isSigner: false,
        isWritable: true,
      })),
      authority,
    }, this.programId)

    return {
      instructions: [ix],
    }
  }

  /**
   * Delete {@link InvestigationRequest}
   * Only investigation creator can delete it
   */
  async delete(props: DeleteInvestigationProps, opts?: ConfirmOptions) {
    const { instructions } = await this.deleteIx(props)
    try {
      const signature = await this.txBuilder
        .addInstruction(...instructions)
        .sendAndConfirm(opts)
      return { signature }
    } catch (e: any) {
      throw errorFromCode(e.code) ?? e
    }
  }

  async revealShareIx(props: RevealShareProps) {
    const authority = this.provider.publicKey

    const investigationRequest = await this.load(props.investigationRequest)
    const { proofRequest, circuit } = await this.proofRequest
      .loadFull(investigationRequest.proofRequest, ['circuit'])

    if (!circuit) {
      throw new Error(`Unable to find Circuit account at ${proofRequest.circuit}`)
    }

    const signals = getSignals(
      [...circuit?.outputs ?? [], ...circuit?.publicSignals ?? []],
      proofRequest.publicInputs.map(Albus.crypto.utils.bytesToBigInt),
    )

    if (signals.encryptedShare === undefined) {
      throw new Error(`The circuit "${circuit.code}" does not support data encryption...`)
    }

    const babyJubKey = Albus.zkp.getBabyJubPrivateKey(Keypair.fromSecretKey(props.encryptionKey))
    const ePk = babyJubKey.public().p

    this.trace('revealShare', 'ePublicKey:', ePk)
    this.trace('revealShare', 'trusteePublicKey:', signals.trusteePublicKey)

    const index = (signals.trusteePublicKey as bigint[][] ?? [])
      .findIndex(pk => String(pk) === String(ePk))

    if (index < 0) {
      throw new Error('Unable to find a trustee pubkey...')
    }

    const [trustee] = this.pda.trustee(babyJubKey.public().compress())
    const [investigationRequestShare] = this.pda.investigationRequestShare(props.investigationRequest, trustee)

    this.trace('revealShare', `trusteeAddress: ${trustee}`)
    this.trace('revealShare', `investigationRequestShareAddress: ${investigationRequestShare}`)

    const encryptedShare = signals.encryptedShare?.[index]
    if (!encryptedShare) {
      throw new Error(`Unable to find an encrypted share with index #${index}`)
    }

    const userPublicKey = signals.userPublicKey as [bigint, bigint]
    const sharedKey = Albus.zkp.generateEcdhSharedKey(props.encryptionKey, userPublicKey)

    this.trace('revealShare', `userPublicKey:`, userPublicKey)
    this.trace('revealShare', `encryptionKey:`, props.encryptionKey)
    this.trace('revealShare', `encryptedShare:`, encryptedShare)
    this.trace('revealShare', `sharedKey:`, sharedKey)

    const secretShare = Albus.crypto.Poseidon.decrypt(encryptedShare, sharedKey, 1, signals.timestamp as bigint)

    this.trace('revealShare', `secretShare:`, secretShare)

    const newEncryptedShare = await Albus.crypto.XC20P.encryptBytes(
      Albus.crypto.utils.bigintToBytes(secretShare[0]),
      investigationRequest.encryptionKey,
    )

    const ix = createRevealSecretShareInstruction({
      investigationRequestShare,
      investigationRequest: new PublicKey(props.investigationRequest),
      trustee,
      authority,
    }, {
      data: {
        share: newEncryptedShare,
        index: index + 1,
      },
    }, this.programId)

    return {
      investigationRequest: new PublicKey(props.investigationRequest),
      investigationRequestShare,
      userPublicKey,
      secretShare,
      instructions: [ix],
    }
  }

  /**
   * Reveal a secret share for {@link InvestigationRequest}
   */
  async revealShare(props: RevealShareProps, opts?: ConfirmOptions) {
    const { instructions, investigationRequest, userPublicKey, secretShare } = await this.revealShareIx(props)
    try {
      const signature = await this.txBuilder
        .addInstruction(...instructions)
        .sendAndConfirm(opts)
      return { address: investigationRequest, userPublicKey, secretShare, signature }
    } catch (e: any) {
      throw errorFromCode(e.code) ?? e
    }
  }

  /**
   * Decrypt investigation data
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

    const decryptedShares = new Map<number, bigint>()
    for (const { data, pubkey } of shares) {
      if (data === null || decryptedShares.has(data.index)) {
        continue
      }
      const encBytes = Uint8Array.from(data?.share ?? [])
      if (encBytes.length === 0) {
        this.trace('decryptData', `skip empty ${pubkey}...`)
        continue
      }
      const shareBytes = await Albus.crypto.XC20P.decryptBytes(encBytes, encKeypair.secretKey)
      const share = Albus.crypto.utils.bytesToBigInt(shareBytes)
      decryptedShares.set(data.index, share)
    }

    this.trace('decryptData', 'decryptedShares', Array.from(decryptedShares.entries()))

    const secret = Albus.crypto.reconstructShamirSecret(
      Albus.crypto.babyJub.F,
      investigationRequest.requiredShareCount,
      Array.from(decryptedShares.entries()),
    )

    this.trace('decryptData', 'secret', secret)

    const { proofRequest, circuit } = await this.proofRequest.loadFull(investigationRequest.proofRequest, ['circuit'])

    if (!circuit) {
      throw new Error(`Unable to find Circuit account at ${proofRequest.circuit}`)
    }

    const signals = getSignals(
      [...circuit?.outputs ?? [], ...circuit?.publicSignals ?? []],
      proofRequest.publicInputs.map(Albus.crypto.utils.bytesToBigInt),
    )

    return this.proofRequest.decryptData({ secret, signals })
  }
}

export type CreateInvestigationProps = {
  proofRequest: PublicKeyInitData | ProofRequest
  encryptionKey?: PublicKey
}

export type DeleteInvestigationProps = {
  investigationRequest: PublicKeyInitData
}

export type FindInvestigationProps = {
  authority?: PublicKeyInitData
  serviceProvider?: PublicKeyInitData
  proofRequest?: PublicKeyInitData
  proofRequestOwner?: PublicKeyInitData
  trustee?: PublicKeyInitData
  status?: InvestigationStatus
  noData?: boolean
}

export type FindInvestigationShareProps = {
  trustee?: PublicKeyInitData
  proofRequestOwner?: PublicKeyInitData
  investigationRequest?: PublicKeyInitData
  status?: RevelationStatus
  index?: number
  noData?: boolean
}

export type RevealShareProps = {
  investigationRequest: PublicKeyInitData
  encryptionKey: Uint8Array
}

export type DecryptDataProps = {
  investigationRequest: PublicKeyInitData
  encryptionKey: Uint8Array
}
