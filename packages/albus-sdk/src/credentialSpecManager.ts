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

import type {
  Commitment,
  GetMultipleAccountsConfig,
  PublicKeyInitData,
} from '@solana/web3.js'
import {
  PublicKey,
} from '@solana/web3.js'
import { capitalize } from 'lodash-es'
import { BaseManager } from './base'

import {
  CredentialSpec,
  createCreateCredentialSpecInstruction,
  createDeleteCredentialSpecInstruction,
  credentialSpecDiscriminator,
} from './generated'
import type { SendOpts } from './utils'

const MAX_CRED_SPEC_CODE_LEN = 16
const MAX_CRED_SPEC_NAME_LEN = 32

export class CredentialSpecManager extends BaseManager {
  /**
   * Load {@link CredentialSpec} by {@link addr}
   */
  async load(addr: PublicKeyInitData | CredentialSpec, commitment?: Commitment) {
    if (addr instanceof CredentialSpec) {
      return addr
    }
    return CredentialSpec.fromAccountAddress(this.provider.connection, new PublicKey(addr), commitment)
  }

  /**
   * Load multiple {@link CredentialSpec}s
   */
  async loadMultiple(addrs: PublicKey[], commitmentOrConfig?: Commitment | GetMultipleAccountsConfig) {
    return (await this.provider.connection.getMultipleAccountsInfo(addrs, commitmentOrConfig))
      .filter(acc => acc !== null)
      .map(acc => CredentialSpec.fromAccountInfo(acc!)[0])
  }

  async createIx(props: CreateCredentialSpecProps) {
    const authority = this.provider.publicKey
    const issuer = new PublicKey(props.issuer)
    const [address] = this.pda.credentialSpec(issuer, props.code)

    if (props.code.length > MAX_CRED_SPEC_CODE_LEN) {
      throw new Error(`Code length must be less or equal than ${MAX_CRED_SPEC_CODE_LEN} bytes`)
    }

    if (props.name && props.name.length > MAX_CRED_SPEC_NAME_LEN) {
      throw new Error(`Name length must be less or equal than ${MAX_CRED_SPEC_NAME_LEN} bytes`)
    }

    const ix = createCreateCredentialSpecInstruction({
      authority,
      credentialSpec: address,
      issuer,
    }, {
      data: {
        code: props.code,
        name: props.name ?? capitalize(props.code),
        uri: props.uri ?? '',
      },
    }, this.programId)

    return {
      address,
      instructions: [ix],
    }
  }

  /**
   * Create new Credential Spec
   */
  async create(props: CreateCredentialSpecProps, opts?: SendOpts) {
    const { address, instructions } = await this.createIx(props)

    const signature = await this.txBuilder
      .addInstruction(...instructions)
      .sendAndConfirm(opts)

    return { address, signature }
  }

  deleteIx(props: DeleteCredentialSpecProps) {
    const authority = this.provider.publicKey
    const issuer = new PublicKey(props.issuer)
    const [address] = this.pda.credentialSpec(issuer, props.code)

    const ix = createDeleteCredentialSpecInstruction({
      authority,
      credentialSpec: address,
      issuer,
    }, this.programId)

    return {
      address,
      instructions: [ix],
    }
  }

  /**
   * Delete Credential Spec
   */
  async delete(props: DeleteCredentialSpecProps, opts?: SendOpts) {
    const { instructions } = this.deleteIx(props)

    const signature = await this.txBuilder
      .addInstruction(...instructions)
      .sendAndConfirm(opts)

    return { signature }
  }

  /**
   * Find Credential Spec
   */
  async find(props: FindCredentialSpecProps = {}) {
    const builder = CredentialSpec.gpaBuilder(this.programId)
      .addFilter('accountDiscriminator', credentialSpecDiscriminator)

    if (props.noData) {
      builder.config.dataSlice = {
        offset: 0,
        length: 0,
      }
    }

    if (props.code) {
      builder.addFilter('code', props.code)
    }

    if (props.name) {
      builder.addFilter('name', props.name)
    }

    if (props.issuer) {
      builder.addFilter('issuer', new PublicKey(props.issuer))
    }

    return (await builder.run(this.provider.connection))
      .map((acc) => {
        return {
          pubkey: acc.pubkey,
          data: props.noData ? null : CredentialSpec.fromAccountInfo(acc.account)[0],
        }
      })
  }
}

export type CreateCredentialSpecProps = {
  issuer: PublicKeyInitData
  code: string
  // Default value is code
  name?: string
  uri?: string
}

export type DeleteCredentialSpecProps = {
  code: string
  issuer: PublicKeyInitData
}

export type FindCredentialSpecProps = {
  code?: string
  name?: string
  issuer?: PublicKeyInitData
  noData?: boolean
}
