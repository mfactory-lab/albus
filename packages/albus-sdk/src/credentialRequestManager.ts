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
  ConfirmOptions,
  GetMultipleAccountsConfig,
  PublicKeyInitData, Signer } from '@solana/web3.js'
import {
  PublicKey,
} from '@solana/web3.js'
import { BaseManager } from './base'

import {
  CredentialRequest,
  createRequestCredentialInstruction,
  credentialRequestDiscriminator,
} from './generated'
import { getAssociatedTokenAddress } from './utils'

export class CredentialRequestManager extends BaseManager {
  /**
   * Load {@link CredentialRequest} by {@link addr}
   */
  async load(addr: PublicKeyInitData | CredentialRequest, commitment?: Commitment) {
    if (addr instanceof CredentialRequest) {
      return addr
    }
    return CredentialRequest.fromAccountAddress(this.provider.connection, new PublicKey(addr), commitment)
  }

  /**
   * Load multiple {@link CredentialRequest}s
   */
  async loadMultiple(addrs: PublicKey[], commitmentOrConfig?: Commitment | GetMultipleAccountsConfig) {
    return (await this.provider.connection.getMultipleAccountsInfo(addrs, commitmentOrConfig))
      .filter(acc => acc !== null)
      .map(acc => CredentialRequest.fromAccountInfo(acc!)[0])
  }

  createIx(props: CreateCredentialRequestProps) {
    const authority = this.provider.publicKey
    const issuer = new PublicKey(props.issuer)
    const credentialMint = new PublicKey(props.mint)
    const credentialToken = getAssociatedTokenAddress(credentialMint, authority)
    const [credentialSpec] = this.pda.credentialSpec(issuer, props.specId)
    const [address] = this.pda.credentialRequest(credentialSpec, authority)

    const ix = createRequestCredentialInstruction({
      credentialRequest: address,
      credentialSpec,
      credentialMint,
      credentialToken,
      issuer,
      authority,
    }, {
      data: {
        uri: props.uri ?? '',
      },
    }, this.programId)

    return {
      address,
      instructions: [ix],
    }
  }

  /**
   * Create new Credential Request.
   */
  async create(props: CreateCredentialRequestProps, opts?: TxOpts) {
    const { address, instructions } = this.createIx(props)

    const builder = this.txBuilder
      .addInstruction(...instructions)

    if (opts?.priorityFee) {
      builder.withPriorityFee(opts.priorityFee)
    }

    const signature = await builder.sendAndConfirm(opts?.confirm, opts?.feePayer)

    return { address, signature }
  }

  /**
   * Find Credential Requests
   */
  async find(props: FindCredentialRequestProps = {}) {
    const builder = CredentialRequest.gpaBuilder(this.programId)
      .addFilter('accountDiscriminator', credentialRequestDiscriminator)

    if (props.noData) {
      builder.config.dataSlice = {
        offset: 0,
        length: 0,
      }
    }

    if (props.owner) {
      builder.addFilter('owner', new PublicKey(props.owner))
    }

    if (props.issuer) {
      builder.addFilter('issuer', new PublicKey(props.issuer))
    }

    if (props.credentialSpec) {
      builder.addFilter('credentialSpec', new PublicKey(props.credentialSpec))
    }

    if (props.credentialMint) {
      builder.addFilter('credentialMint', new PublicKey(props.credentialMint))
    }

    if (props.status) {
      builder.addFilter('status', props.status)
    }

    return (await builder.run(this.provider.connection))
      .map((acc) => {
        return {
          pubkey: acc.pubkey,
          data: props.noData ? null : CredentialRequest.fromAccountInfo(acc.account)[0],
        }
      })
  }

  validate() {
    //
  }
}

export type TxOpts = {
  confirm?: ConfirmOptions
  feePayer?: Signer
  priorityFee?: number
}

export type CreateCredentialRequestProps = {
  /// Credential mint address
  mint: PublicKeyInitData
  /// Issuer public key
  issuer: PublicKeyInitData
  /// Credential specification code
  specId: string
  /// Request payload uri
  uri?: string
}

export type FindCredentialRequestProps = {
  owner?: PublicKeyInitData
  issuer?: PublicKeyInitData
  credentialSpec?: PublicKeyInitData
  credentialMint?: PublicKeyInitData
  status?: number
  noData?: boolean
}
