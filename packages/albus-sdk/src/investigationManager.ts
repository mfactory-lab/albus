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
import type { Commitment, ConfirmOptions, GetMultipleAccountsConfig, PublicKeyInitData } from '@solana/web3.js'
import { PublicKey, Transaction } from '@solana/web3.js'
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
   */
  async load(addr: PublicKeyInitData, commitment?: Commitment) {
    return InvestigationRequest.fromAccountAddress(this.provider.connection, new PublicKey(addr), commitment)
  }

  /**
   * Load multiple {@link InvestigationRequest}s
   */
  async loadMultiple(addrs: PublicKey[], commitmentOrConfig?: Commitment | GetMultipleAccountsConfig) {
    return (await this.provider.connection.getMultipleAccountsInfo(addrs, commitmentOrConfig))
      .filter(acc => acc !== null)
      .map(acc => InvestigationRequest.fromAccountInfo(acc!)[0])
  }

  /**
   * Load {@link InvestigationRequestShare} by {@link addr}
   */
  async loadShare(addr: PublicKeyInitData, commitment?: Commitment) {
    return InvestigationRequestShare.fromAccountAddress(this.provider.connection, new PublicKey(addr), commitment)
  }

  /**
   * Load multiple {@link InvestigationRequestShare}s
   */
  async loadMultipleShares(addrs: PublicKey[], commitmentOrConfig?: Commitment | GetMultipleAccountsConfig) {
    return (await this.provider.connection.getMultipleAccountsInfo(addrs, commitmentOrConfig))
      .filter(acc => acc !== null)
      .map(acc => InvestigationRequestShare.fromAccountInfo(acc!)[0])
  }

  /**
   * Find {@link InvestigationRequest}
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

    return (await builder.run(this.provider.connection)).map((acc) => {
      return {
        pubkey: acc.pubkey,
        data: props.noData ? null : InvestigationRequest.fromAccountInfo(acc.account)[0],
      }
    })
  }

  /**
   * Find {@link InvestigationRequestShare}
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
   * Add new {@link InvestigationRequest}
   */
  async create(props: CreateInvestigationProps, opts?: ConfirmOptions) {
    const authority = this.provider.publicKey

    const proofRequest = await this.proofRequest.load(props.proofRequest)
    if (!proofRequest.proof) {
      throw new Error('Proof request is not proved yet')
    }

    const service = await this.service.load(proofRequest.serviceProvider)
    const trusteeKeys = await this.service.loadTrusteeKeys(service.trustees)
    const selectedTrustees: PublicKey[] = []

    // Find selected trustees
    for (const [i, key] of trusteeKeys.entries()) {
      const trustee = service.trustees[i]
      if (!key || !trustee) {
        console.log(`Invalid trustee #${i}`)
        continue
      }
      const aX = proofRequest.publicInputs.find(i => Albus.crypto.utils.arrayToBigInt(i) === key[0])
      const aY = proofRequest.publicInputs.find(i => Albus.crypto.utils.arrayToBigInt(i) === key[1])
      if (aX && aY) {
        selectedTrustees.push(trustee)
      }
    }

    const [investigationRequest] = this.pda.investigationRequest(props.proofRequest, authority)

    const instruction = createCreateInvestigationRequestInstruction({
      investigationRequest,
      proofRequest: new PublicKey(props.proofRequest),
      serviceProvider: proofRequest.serviceProvider,
      authority,
      anchorRemainingAccounts: selectedTrustees.length > 0
        ? selectedTrustees.map(pubkey => ({
          pubkey,
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
      const tx = new Transaction().add(instruction)
      const signature = await this.provider.sendAndConfirm(tx, [], opts)
      return { address: investigationRequest, signature }
    } catch (e: any) {
      throw errorFromCode(e.code) ?? e
    }
  }

  /**
   * Add new {@link InvestigationRequest}
   */
  async revealShare(props: RevealShareProps, opts?: ConfirmOptions) {
    const authority = this.provider.publicKey

    const investigationRequest = await this.load(props.investigationRequest)
    const [investigationRequestShare] = this.pda.investigationRequestShare(props.investigationRequest, props.index)

    // Decode share
    // investigationRequest.encryptionKey

    const instruction = createRevealSecretShareInstruction({
      investigationRequestShare,
      investigationRequest: new PublicKey(props.investigationRequest),
      serviceProvider: investigationRequest.serviceProvider,
      trustee: investigationRequest.serviceProvider,
      authority,
    }, {
      data: {
        index: props.index,
        share: '...',
      },
    })
    try {
      const tx = new Transaction().add(instruction)
      const signature = await this.provider.sendAndConfirm(tx, [], opts)
      return { address: investigationRequest, signature }
    } catch (e: any) {
      throw errorFromCode(e.code) ?? e
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

export interface RevealShareProps {
  investigationRequest: PublicKeyInitData
  index: number
}

export interface FindInvestigationShareProps {
  trustee?: PublicKeyInitData
  proofRequestOwner?: PublicKeyInitData
  investigationRequest?: PublicKeyInitData
  status?: RevelationStatus
  index?: number
  noData?: boolean
}
