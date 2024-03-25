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

import type { Commitment, ConfirmOptions, GetMultipleAccountsConfig, PublicKeyInitData } from '@solana/web3.js'
import { PublicKey } from '@solana/web3.js'
import { BaseManager } from './base'
import {
  Trustee,
  createCreateTrusteeInstruction,
  createDeleteTrusteeInstruction,
  createUpdateTrusteeInstruction,
  createVerifyTrusteeInstruction,
  trusteeDiscriminator,
} from './generated'

export class TrusteeManager extends BaseManager {
  /**
   * Load trustee by {@link addr}
   */
  async load(addr: PublicKeyInitData, commitment?: Commitment) {
    return Trustee.fromAccountAddress(this.provider.connection, new PublicKey(addr), commitment)
  }

  /**
   * Load multiple trustees
   */
  async loadMultiple(addrs: PublicKey[], commitmentOrConfig?: Commitment | GetMultipleAccountsConfig) {
    return (await this.provider.connection.getMultipleAccountsInfo(addrs, commitmentOrConfig))
      .filter(acc => acc !== null)
      .map(acc => Trustee.fromAccountInfo(acc!)[0])
  }

  /**
   * Load {@link Trustee} by key
   */
  async loadByKey(key: number[], commitment?: Commitment) {
    return Trustee.fromAccountAddress(this.provider.connection, this.pda.trustee(key)[0], commitment)
  }

  /**
   * Load {@link Trustee} by authority
   */
  async loadByAuthority(authority: PublicKeyInitData) {
    return this.find({ authority }).then(res => res[0])
  }

  /**
   * Find trustees
   */
  async find(props: FindTrusteeProps = {}) {
    const builder = Trustee.gpaBuilder(this.programId)
      .addFilter('accountDiscriminator', trusteeDiscriminator)

    if (props.noData) {
      builder.config.dataSlice = {
        offset: 0,
        length: 0,
      }
    }

    if (props.authority) {
      builder.addFilter('authority', new PublicKey(props.authority))
    }

    if (props.key) {
      builder.addFilter('key', props.key)
    }

    if (props.name) {
      builder.addFilter('name', props.name)
    }

    if (props.email) {
      builder.addFilter('email', props.email)
    }

    if (props.verified) {
      builder.addFilter('isVerified', props.verified)
    }

    return (await builder.run(this.provider.connection))
      .map((acc) => {
        return {
          pubkey: acc.pubkey,
          data: props.noData ? null : Trustee.fromAccountInfo(acc.account)[0],
        }
      })
  }

  createIx(props: CreateTrusteeProps) {
    const authority = this.provider.publicKey
    const [address] = this.pda.trustee(props.key)

    const ix = createCreateTrusteeInstruction({
      trustee: address,
      authority,
    }, {
      data: {
        key: props.key,
        name: props.name,
        email: props.email,
        website: props.website,
        authority: props.authority ?? null,
      },
    }, this.programId)

    return {
      address,
      instructions: [ix],
    }
  }

  /**
   * Add new trustee
   */
  async create(props: CreateTrusteeProps, opts?: ConfirmOptions) {
    const { address, instructions } = this.createIx(props)

    const signature = await this.txBuilder
      .addInstruction(...instructions)
      .sendAndConfirm(opts)

    return { address, signature }
  }

  updateIx(props: UpdateTrusteeProps) {
    const authority = this.provider.publicKey
    const [address] = this.pda.trustee(props.key)

    const ix = createUpdateTrusteeInstruction({
      trustee: address,
      authority,
    }, {
      data: {
        name: props.name ?? null,
        email: props.email ?? null,
        website: props.website ?? null,
        newAuthority: props.newAuthority ?? null,
      },
    }, this.programId)

    return {
      address,
      instructions: [ix],
    }
  }

  /**
   * Update trustee
   */
  async update(props: UpdateTrusteeProps, opts?: ConfirmOptions) {
    const { address, instructions } = this.updateIx(props)

    const signature = await this.txBuilder
      .addInstruction(...instructions)
      .sendAndConfirm(opts)

    return { address, signature }
  }

  verifyIx(trustee: PublicKeyInitData) {
    const authority = this.provider.publicKey
    const ix = createVerifyTrusteeInstruction({
      trustee: new PublicKey(trustee),
      authority,
    }, this.programId)

    return {
      instructions: [ix],
    }
  }

  /**
   * Verify trustee
   */
  async verify(addr: PublicKeyInitData, opts?: ConfirmOptions) {
    const { instructions } = this.verifyIx(addr)

    const signature = await this.txBuilder
      .addInstruction(...instructions)
      .sendAndConfirm(opts)

    return { signature }
  }

  deleteIx(addr: PublicKeyInitData) {
    const authority = this.provider.publicKey
    const ix = createDeleteTrusteeInstruction({
      trustee: new PublicKey(addr),
      authority,
    }, this.programId)

    return {
      instructions: [ix],
    }
  }

  /**
   * Delete trustee
   */
  async delete(addr: PublicKeyInitData, opts?: ConfirmOptions) {
    const { instructions } = this.deleteIx(addr)

    const signature = await this.txBuilder
      .addInstruction(...instructions)
      .sendAndConfirm(opts)

    return { signature }
  }

  async deleteByKeyIx(key: ArrayLike<number>) {
    return this.deleteIx(this.pda.trustee(key)[0])
  }

  async deleteByKey(key: ArrayLike<number>, opts?: ConfirmOptions) {
    return this.delete(this.pda.trustee(key)[0], opts)
  }
}

export type CreateTrusteeProps = {
  key: number[] /* size: 32 */
  name: string
  email: string
  website: string
  authority?: PublicKey
}

export type UpdateTrusteeProps = {
  key: ArrayLike<number>
  newAuthority?: PublicKey
  name?: string
  email?: string
  website?: string
}

export type FindTrusteeProps = {
  name?: string
  email?: string
  authority?: PublicKeyInitData
  verified?: boolean
  key?: number[]
  noData?: boolean
}
