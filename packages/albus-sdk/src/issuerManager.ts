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
  PublicKeyInitData, Signer,
} from '@solana/web3.js'
import { PublicKey, Transaction } from '@solana/web3.js'
import { BaseManager } from './base'

import {
  Issuer,
  createCreateIssuerInstruction, createDeleteIssuerInstruction, errorFromCode, issuerDiscriminator,
} from './generated'

export class IssuerManager extends BaseManager {
  /**
   * Load issuer by {@link addr}
   * @param addr
   * @param commitment
   */
  async load(addr: PublicKeyInitData | Issuer, commitment?: Commitment) {
    if (addr instanceof Issuer) {
      return addr
    }
    return Issuer.fromAccountAddress(this.provider.connection, new PublicKey(addr), commitment)
  }

  /**
   * Load issuer by {@link id}
   * @param id
   * @param commitment
   */
  async loadById(id: string, commitment?: Commitment) {
    return this.load(this.pda.issuer(id)[0], commitment)
  }

  async loadMultiple(addrs: PublicKey[], commitmentOrConfig?: Commitment | GetMultipleAccountsConfig) {
    return (await this.provider.connection.getMultipleAccountsInfo(addrs, commitmentOrConfig))
      .filter(acc => acc !== null)
      .map(acc => Issuer.fromAccountInfo(acc!)[0])
  }

  /**
   * Find issuers
   * @param props
   */
  async find(props: FindIssuerProps = {}) {
    const builder = Issuer.gpaBuilder()
      .addFilter('accountDiscriminator', issuerDiscriminator)

    if (props.noData) {
      builder.config.dataSlice = {
        offset: 0,
        length: 0,
      }
    }

    if (props.authority) {
      builder.addFilter('authority', new PublicKey(props.authority))
    }

    if (props.pubkey) {
      builder.addFilter('pubkey', new PublicKey(props.pubkey))
    }

    if (props.code) {
      builder.addFilter('code', props.code)
    }

    if (props.active) {
      builder.addFilter('isDisabled', false)
    }

    return (await builder.run(this.provider.connection))
      .map(acc => ({
        pubkey: acc.pubkey,
        data: props.noData ? null : Issuer.fromAccountInfo(acc.account)[0],
      }))
  }

  /**
   * Create a new issuer
   * @param props
   * @param opts
   */
  async create(props: CreateIssuerProps, opts?: ConfirmOptions) {
    const authority = this.provider.publicKey
    const [issuer] = this.pda.issuer(props.code)

    const pubkey = props.keypair.publicKey
    const pubkeyBjj = Albus.crypto.eddsa.prv2pub(props.keypair.secretKey).reduce((acc: number[], i) => {
      const n = Albus.crypto.utils.bigintToBytes(i)
      return [...acc, ...n]
    }, [])

    const instruction = createCreateIssuerInstruction(
      {
        issuer,
        authority,
      },
      {
        data: {
          code: props.code,
          name: props.name,
          description: props.description ?? '',
          pubkey,
          pubkeyBjj,
        },
      },
    )

    try {
      const tx = new Transaction().add(instruction)
      const signature = await this.provider.sendAndConfirm(tx, [], {
        ...this.provider.opts,
        ...opts,
      })
      return {
        address: issuer,
        signature,
      }
    } catch (e: any) {
      throw errorFromCode(e.code) ?? e
    }
  }

  /**
   * Delete issuer
   * @param props
   * @param opts
   */
  async delete(props: DeleteIssuerProps, opts?: ConfirmOptions) {
    const authority = this.provider.publicKey
    const instruction = createDeleteIssuerInstruction({
      issuer: new PublicKey(props.issuer),
      authority,
    })
    try {
      const tx = new Transaction().add(instruction)
      const signature = await this.provider.sendAndConfirm(tx, [], {
        ...this.provider.opts,
        ...opts,
      })
      return { signature }
    } catch (e: any) {
      throw errorFromCode(e.code) ?? e
    }
  }
}

export type FindIssuerProps = {
  code?: string
  authority?: PublicKeyInitData
  pubkey?: PublicKeyInitData
  active?: boolean
  noData?: boolean
}

export type CreateIssuerProps = {
  code: string
  name: string
  description?: string
  keypair: Signer
}

export type DeleteIssuerProps = {
  issuer: PublicKeyInitData
}
