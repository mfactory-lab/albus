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

import {
  type Commitment,
  type GetMultipleAccountsConfig,
  type Keypair, PublicKey,
  type PublicKeyInitData, SYSVAR_INSTRUCTIONS_PUBKEY,
} from '@solana/web3.js'
import { PROGRAM_ID as METADATA_PROGRAM_ID } from '@metaplex-foundation/mpl-token-metadata/dist/src/generated'
import { BaseManager } from './base'

import {
  CredentialRequest,
  createDeleteCredentialRequestInstruction,
  createRequestCredentialInstruction,
  createUpdateCredentialRequestInstruction,
  credentialRequestDiscriminator,
} from './generated'
import type { SendOpts } from './utils'
import { getAssociatedTokenAddress, getMetadataPDA } from './utils'

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

  /**
   * Create new Credential Request instruction.
   */
  createIx(props: CreateCredentialRequestProps) {
    const authority = this.provider.publicKey
    const credentialOwner = props?.owner ? props.owner.publicKey : authority

    const issuer = new PublicKey(props.issuer)
    const credentialMint = new PublicKey(props.mint)
    const credentialToken = getAssociatedTokenAddress(credentialMint, credentialOwner)

    let credentialSpec: PublicKey
    if (props.spec) {
      credentialSpec = new PublicKey(props.spec)
    } else if (props.specCode) {
      [credentialSpec] = this.pda.credentialSpec(issuer, props.specCode)
    } else {
      throw new Error('Either `spec` or `specCode` must be provided')
    }

    const [address] = this.pda.credentialRequest(credentialSpec, authority)

    const ix = createRequestCredentialInstruction({
      albusAuthority: this.pda.authority()[0],
      credentialMetadata: getMetadataPDA(credentialMint),
      credentialRequest: address,
      credentialSpec,
      credentialMint,
      credentialToken,
      credentialOwner,
      issuer,
      authority,
      metadataProgram: METADATA_PROGRAM_ID,
      sysvarInstructions: SYSVAR_INSTRUCTIONS_PUBKEY,
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
   * Create a new Credential Request.
   */
  async create(props: CreateCredentialRequestProps, opts?: SendOpts) {
    const { address, instructions } = this.createIx(props)

    const builder = this.txBuilder
      .addInstruction(...instructions)

    if (props?.owner) {
      builder.addSigner(props.owner)
    }

    const signature = await builder.sendAndConfirm(opts)

    return { address, signature }
  }

  /**
   * Update the Credential Request instruction.
   */
  updateIx(props: UpdateCredentialRequestProps) {
    const credentialRequest = new PublicKey(props.credentialRequest)
    const authority = this.provider.publicKey
    const issuer = new PublicKey(props.issuer)

    // const req = await this.load(credentialRequest)
    // req.issuer

    const ix = createUpdateCredentialRequestInstruction({
      credentialRequest,
      issuer,
      authority,
    }, {
      data: {
        status: props.status,
        message: props.message ?? '',
      },
    }, this.programId)

    return {
      instructions: [ix],
    }
  }

  /**
   * Update the Credential Request.
   */
  async update(props: UpdateCredentialRequestProps, opts?: SendOpts) {
    const { instructions } = this.updateIx(props)

    const signature = await this.txBuilder
      .addInstruction(...instructions)
      .sendAndConfirm(opts)

    return { signature }
  }

  /**
   * Delete the Credential Request instruction.
   */
  deleteIx(props: DeleteCredentialRequestProps) {
    const credentialRequest = new PublicKey(props.credentialRequest)
    const authority = this.provider.publicKey

    const ix = createDeleteCredentialRequestInstruction({
      credentialRequest,
      authority,
    }, this.programId)

    return {
      instructions: [ix],
    }
  }

  /**
   * Delete the Credential Request
   */
  async delete(props: DeleteCredentialRequestProps, opts?: SendOpts) {
    const { instructions } = this.deleteIx(props)

    const signature = await this.txBuilder
      .addInstruction(...instructions)
      .sendAndConfirm(opts)

    return { signature }
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

    if (props.authority) {
      builder.addFilter('authority', new PublicKey(props.authority))
    }

    if (props.credentialOwner) {
      builder.addFilter('credentialOwner', new PublicKey(props.credentialOwner))
    }

    if (props.credentialSpec) {
      builder.addFilter('credentialSpec', new PublicKey(props.credentialSpec))
    }

    if (props.credentialMint) {
      builder.addFilter('credentialMint', new PublicKey(props.credentialMint))
    }

    if (props.issuer) {
      builder.addFilter('issuer', new PublicKey(props.issuer))
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
}

export type CreateCredentialRequestProps = {
  /// Credential mint address
  mint: PublicKeyInitData
  /// Issuer address
  issuer: PublicKeyInitData
  /// Credential specification address
  spec?: PublicKeyInitData
  /// Credential specification code
  specCode?: string
  /// Owner of the credential
  owner?: Keypair
  /// Presentation URI
  uri?: string
}

export type UpdateCredentialRequestProps = {
  credentialRequest: PublicKeyInitData
  issuer: PublicKeyInitData
  status: number
  message?: string
}

export type DeleteCredentialRequestProps = {
  credentialRequest: PublicKeyInitData
}

export type FindCredentialRequestProps = {
  authority?: PublicKeyInitData
  issuer?: PublicKeyInitData
  credentialOwner?: PublicKeyInitData
  credentialSpec?: PublicKeyInitData
  credentialMint?: PublicKeyInitData
  status?: number
  noData?: boolean
}
