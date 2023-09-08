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
import type { Commitment, ConfirmOptions, PublicKeyInitData } from '@solana/web3.js'
import { PublicKey, Transaction } from '@solana/web3.js'
import type { CreateTrusteeData, UpdateTrusteeData } from './generated'
import {
  Trustee,
  createCreateTrusteeInstruction,
  createDeleteTrusteeInstruction,
  createUpdateTrusteeInstruction,
  createVerifyTrusteeInstruction, errorFromCode, trusteeDiscriminator,
} from './generated'
import type { PdaManager } from './pda'

export class TrusteeManager {
  constructor(
    readonly provider: AnchorProvider,
    readonly pda: PdaManager,
  ) {
  }

  /**
   * Load trustee by {@link addr}
   */
  async load(addr: PublicKeyInitData, commitment?: Commitment) {
    return Trustee.fromAccountAddress(this.provider.connection, new PublicKey(addr), commitment)
  }

  /**
   * Load trustee by authority
   */
  async loadByAuthority(authority: PublicKeyInitData, commitment?: Commitment) {
    return Trustee.fromAccountAddress(this.provider.connection, this.pda.trustee(authority)[0], commitment)
  }

  /**
   * Find trustees
   */
  async find(filter: FindTrusteeProps = {}) {
    const builder = Trustee.gpaBuilder()
      .addFilter('accountDiscriminator', trusteeDiscriminator)

    if (filter.authority) {
      builder.addFilter('authority', new PublicKey(filter.authority))
    }

    if (filter.key) {
      builder.addFilter('key', filter.key)
    }

    if (filter.verified) {
      builder.addFilter('isVerified', filter.verified)
    }

    let res = (await builder.run(this.provider.connection)).map((acc) => {
      return {
        pubkey: acc.pubkey,
        data: Trustee.fromAccountInfo(acc.account)[0],
      }
    })

    if (filter.name) {
      res = res.filter(({ data }) => data.name.includes(filter.name!))
    }

    if (filter.email) {
      res = res.filter(({ data }) => data.email.includes(filter.email!))
    }

    return res
  }

  /**
   * Add new trustee
   */
  async create(props: CreateTrusteeProps, opts?: ConfirmOptions) {
    const authority = this.provider.publicKey
    const [trustee] = this.pda.trustee(authority)
    const instruction = createCreateTrusteeInstruction({
      trustee,
      authority,
    }, {
      data: {
        key: props.key,
        name: props.name,
        email: props.email,
        website: props.website,
      },
    })
    try {
      const tx = new Transaction().add(instruction)
      const signature = await this.provider.sendAndConfirm(tx, [], opts)
      return { address: trustee, signature }
    } catch (e: any) {
      throw errorFromCode(e.code) ?? e
    }
  }

  /**
   * Update trustee
   */
  async update(props: UpdateTrusteeProps, opts?: ConfirmOptions) {
    const authority = this.provider.publicKey
    const [trustee] = this.pda.trustee(authority)
    const instruction = createUpdateTrusteeInstruction({
      trustee,
      authority,
    }, {
      data: {
        key: props.key,
        name: props.name,
        email: props.email,
        website: props.website,
      },
    })
    try {
      const tx = new Transaction().add(instruction)
      const signature = await this.provider.sendAndConfirm(tx, [], opts)
      return { address: trustee, signature }
    } catch (e: any) {
      throw errorFromCode(e.code) ?? e
    }
  }

  /**
   * Verify trustee
   */
  async verify(trustee: PublicKeyInitData, opts?: ConfirmOptions) {
    const authority = this.provider.publicKey
    const instruction = createVerifyTrusteeInstruction({
      trustee: new PublicKey(trustee),
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
   * Delete trustee
   */
  async delete(props: { authority: PublicKeyInitData }, opts?: ConfirmOptions) {
    const authority = this.provider.publicKey
    const [trustee] = this.pda.trustee(props.authority)
    const instruction = createDeleteTrusteeInstruction({
      trustee,
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
}

export interface CreateTrusteeProps extends CreateTrusteeData {}
export interface UpdateTrusteeProps extends UpdateTrusteeData {}

export interface FindTrusteeProps {
  name?: string
  email?: string
  authority?: PublicKeyInitData
  verified?: boolean
  key?: number[]
}
