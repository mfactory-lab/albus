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
  Signer,
} from '@solana/web3.js'
import { PublicKey } from '@solana/web3.js'
import { BaseManager } from './base'

import {
  Issuer,
  createCreateIssuerInstruction,
  createDeleteIssuerInstruction,
  errorFromCode,
  issuerDiscriminator,
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

  /**
   * Load issuer by authority
   */
  async loadByAuthority(authority: PublicKeyInitData, noData?: boolean) {
    const accounts = await this.find({
      authority,
      noData,
    })
    if (accounts.length === 0) {
      throw new Error(`Unable to find Issuer account by provided pubkey`)
    }
    return accounts[0]!
  }

  /**
   * Load issuer by zk pubkey (babyjub curve)
   */
  async loadByZkPubkey(pubkey: [bigint, bigint], noData?: boolean) {
    const accounts = await this.find({
      zkAuthority: this.zkPubkeyToBytes(pubkey),
      noData,
    })
    if (accounts.length === 0) {
      throw new Error(`Unable to find Issuer account by provided pubkey`)
    }
    return accounts[0]!
  }

  /**
   * Load multiple issuers
   */
  async loadMultiple(addrs: PublicKey[], commitmentOrConfig?: Commitment | GetMultipleAccountsConfig) {
    return (await this.provider.connection.getMultipleAccountsInfo(addrs, commitmentOrConfig))
      .filter(acc => acc !== null)
      .map(acc => Issuer.fromAccountInfo(acc!)[0])
  }

  /**
   * Find issuers and return a map
   */
  async findMapped(props: FindIssuerProps = {}) {
    return (await this.find(props))
      .reduce((a, { pubkey, data }) => {
        a.set(pubkey.toString(), data!)
        return a
      }, new Map<string, Issuer>())
  }

  /**
   * Find issuers
   * @param props
   */
  async find(props: FindIssuerProps = {}) {
    const builder = Issuer.gpaBuilder(this.programId)
      .addFilter('accountDiscriminator', issuerDiscriminator)

    if (props.authority) {
      builder.addFilter('authority', new PublicKey(props.authority))
    }

    if (props.zkAuthority) {
      builder.addFilter('zkAuthority', Array.from(props.zkAuthority))
    }

    if (props.code) {
      builder.addFilter('code', props.code)
    }

    if (props.active) {
      builder.addFilter('isDisabled', false)
    }

    if (props.noData) {
      builder.config.dataSlice = {
        offset: 0,
        length: 0,
      }
    }

    return (await builder.run(this.provider.connection))
      .map(acc => ({
        pubkey: acc.pubkey,
        data: props.noData ? null : Issuer.fromAccountInfo(acc.account)[0],
      }))
  }

  createIx(props: CreateIssuerProps) {
    const authority = this.provider.publicKey
    const [address] = this.pda.issuer(props.code)

    const ix = createCreateIssuerInstruction({
      issuer: address,
      authority,
    },
    {
      data: {
        code: props.code,
        name: props.name,
        description: props.description ?? '',
        authority: props.keypair.publicKey,
        zkAuthority: this.zkPubkeyToBytes(Albus.crypto.eddsa.prv2pub(props.keypair.secretKey)),
      },
    }, this.programId)

    return {
      address,
      instructions: [ix],
    }
  }

  /**
   * Create a new issuer.
   */
  async create(props: CreateIssuerProps, opts?: ConfirmOptions) {
    const { instructions, address } = this.createIx(props)
    try {
      const signature = await this.txBuilder
        .addInstruction(...instructions)
        .sendAndConfirm(opts)
      return { address, signature }
    } catch (e: any) {
      throw errorFromCode(e.code) ?? e
    }
  }

  deleteIx(props: DeleteIssuerProps) {
    const authority = this.provider.publicKey
    const ix = createDeleteIssuerInstruction({
      issuer: new PublicKey(props.issuer),
      authority,
    }, this.programId)
    return {
      instructions: [ix],
    }
  }

  /**
   * Delete an existing issuer.
   */
  async delete(props: DeleteIssuerProps, opts?: ConfirmOptions) {
    const { instructions } = this.deleteIx(props)
    try {
      const signature = await this.txBuilder
        .addInstruction(...instructions)
        .sendAndConfirm(opts)
      return { signature }
    } catch (e: any) {
      throw errorFromCode(e.code) ?? e
    }
  }

  /**
   * Convert issuer zk-pubkey to bytes.
   */
  private zkPubkeyToBytes(pubkey: [bigint, bigint]) {
    return pubkey.reduce((bytes: number[], i) => {
      return [...bytes, ...Albus.crypto.utils.bigintToBytes(BigInt(i), 32)]
    }, [])
  }
}

export type FindIssuerProps = {
  code?: string
  authority?: PublicKeyInitData
  zkAuthority?: Iterable<number>
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
