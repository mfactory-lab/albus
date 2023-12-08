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

import { PROGRAM_ID as METADATA_PROGRAM_ID } from '@metaplex-foundation/mpl-token-metadata'
import type { VerifiableCredential } from '@albus-finance/core'
import * as Albus from '@albus-finance/core'
import type { ConfirmOptions, PublicKeyInitData, Signer } from '@solana/web3.js'
import { ComputeBudgetProgram, Keypair, PublicKey, SYSVAR_INSTRUCTIONS_PUBKEY } from '@solana/web3.js'
import type { Resolver } from 'did-resolver'
import { BaseManager } from './base'
import { CREDENTIAL_NAME, CREDENTIAL_SYMBOL_CODE, NFT_SYMBOL_PREFIX } from './constants'
import {
  createCreateCredentialInstruction,
  createDeleteCredentialInstruction,
  createUpdateCredentialInstruction,
} from './generated'
import type { ExtendedMetadata } from './utils'
import {
  getAssociatedTokenAddress,
  getMasterEditionPDA,
  getMetadataPDA,
  getParsedNftAccountsByOwner,
  loadNft,
} from './utils'

export class CredentialManager extends BaseManager {
  /**
   * Create new Credential NFT.
   */
  async create(props?: CreateCredentialProps, opts?: TxOpts) {
    const mint = Keypair.generate()
    const authority = props?.owner ? props.owner.publicKey : this.provider.publicKey
    const tokenAccount = getAssociatedTokenAddress(mint.publicKey, authority)

    const ix = createCreateCredentialInstruction({
      authority,
      tokenAccount,
      mint: mint.publicKey,
      payer: this.provider.publicKey,
      albusAuthority: this.pda.authority()[0],
      editionAccount: getMasterEditionPDA(mint.publicKey),
      metadataAccount: getMetadataPDA(mint.publicKey),
      metadataProgram: METADATA_PROGRAM_ID,
      sysvarInstructions: SYSVAR_INSTRUCTIONS_PUBKEY,
    })

    const builder = this.txBuilder
      .addInstruction(ComputeBudgetProgram.setComputeUnitLimit({ units: 300_000 }))
      .addInstruction(ix)
      .addSigner(mint)

    if (props?.owner) {
      builder.addSigner(props.owner)
    }

    const signature = await builder.sendAndConfirm(opts?.confirm, opts?.feePayer)

    return { mintAddress: mint.publicKey, signature }
  }

  /**
   * Update credential data.
   * Require admin authority
   */
  async update(props: UpdateCredentialProps, opts?: TxOpts) {
    const mint = new PublicKey(props.mint)
    const tokenAccount = getAssociatedTokenAddress(mint, new PublicKey(props.owner))

    const ix = createUpdateCredentialInstruction({
      mint,
      tokenAccount,
      albusAuthority: this.pda.authority()[0],
      metadataAccount: getMetadataPDA(mint),
      authority: this.provider.publicKey,
      metadataProgram: METADATA_PROGRAM_ID,
      sysvarInstructions: SYSVAR_INSTRUCTIONS_PUBKEY,
    }, {
      data: {
        name: props.name ?? CREDENTIAL_NAME,
        uri: props.uri,
      },
    })

    const signature = await this.txBuilder
      .addInstruction(ix)
      .sendAndConfirm(opts?.confirm, opts?.feePayer)

    return { signature }
  }

  /**
   * Delete credential and burn credential NFT.
   */
  async delete(props: DeleteCredentialProps, opts?: TxOpts) {
    const mint = new PublicKey(props.mint)
    const authority = props?.owner ? props.owner.publicKey : this.provider.publicKey
    const tokenAccount = getAssociatedTokenAddress(mint, authority)

    const ix = createDeleteCredentialInstruction({
      mint,
      tokenAccount,
      albusAuthority: this.pda.authority()[0],
      editionAccount: getMasterEditionPDA(mint),
      metadataAccount: getMetadataPDA(mint),
      authority,
      metadataProgram: METADATA_PROGRAM_ID,
      sysvarInstructions: SYSVAR_INSTRUCTIONS_PUBKEY,
    })

    const builder = this.txBuilder.addInstruction(ix)

    if (props?.owner) {
      builder.addSigner(props.owner)
    }

    const signature = await builder.sendAndConfirm(opts?.confirm, opts?.feePayer)

    return { signature }
  }

  /**
   * Load a credential associated with a specified address.
   * This function retrieves, verifies, and optionally decrypts the credential.
   */
  async load(mintAddr: PublicKeyInitData, props: LoadCredentialProps = { throwOnError: true }) {
    const nft = await loadNft(this.provider.connection, mintAddr, {
      authority: this.pda.authority()[0],
      code: CREDENTIAL_SYMBOL_CODE,
    })
    return this.getCredentialInfo(nft, props)
  }

  /**
   * Load all credentials for the provided owner.
   * @param props
   */
  async loadAll(props: LoadAllCredentialProps = {}) {
    const accounts = await getParsedNftAccountsByOwner(
      this.provider.connection,
      props.owner ?? this.provider.publicKey,
      {
        // pending credential has empty uri
        uri: props.pending ? '' : undefined,
        symbol: `${NFT_SYMBOL_PREFIX}-${CREDENTIAL_SYMBOL_CODE}`,
        updateAuthority: this.pda.authority()[0],
        withJson: !props.pending,
      },
    )
    const result: Array<CredentialInfo> = []
    for (const account of accounts) {
      result.push({
        address: account.mint,
        credential: await this.getCredentialInfo(account, props),
      })
    }
    return result
  }

  private async getCredentialInfo(nft: ExtendedMetadata, props?: LoadCredentialProps) {
    if (nft.json?.vc !== undefined) {
      try {
        return await Albus.credential.verifyCredential(nft.json.vc, {
          decryptionKey: props?.decryptionKey,
          resolver: props?.resolver,
        })
      } catch (e) {
        console.log(`Credential Verification Error: ${e}`)
        if (props?.throwOnError) {
          throw e
        }
      }
    }
    return {
      data: parseUriData(nft.data.uri),
    } as unknown as VerifiableCredential
  }
}

/**
 * Parse data uri like "data:,status=rejected&iss=sumsub"
 */
function parseUriData(uri: string) {
  const data: Record<string, string> = {}
  if (uri.startsWith('data:')) {
    const qs = uri.split(',')[1] ?? ''
    for (const p of qs.split('&')) {
      const [k, v] = p.split('=')
      if (k && v) {
        data[k] = v
      }
    }
  }
  return data
}

export type TxOpts = {
  confirm?: ConfirmOptions
  feePayer?: Signer
}

export type CredentialInfo = {
  address: PublicKey
  credential: VerifiableCredential & { data?: Record<string, string> }
}

export type CreateCredentialProps = {
  owner?: Keypair
}

export type UpdateCredentialProps = {
  owner: PublicKeyInitData
  mint: PublicKeyInitData
  uri: string
  name?: string
}

export type DeleteCredentialProps = {
  owner?: Keypair
  mint: PublicKeyInitData
}

export type LoadCredentialProps = {
  decryptionKey?: number[] | Uint8Array
  throwOnError?: boolean
  resolver?: Resolver
}

export type LoadAllCredentialProps = {
  owner?: PublicKey
  pending?: boolean
} & LoadCredentialProps

export type LoadPresentationProps = NonNullable<unknown> & LoadCredentialProps

export type CreatePresentationProps = {
  holderSecretKey: number[] | Uint8Array
  credentials: VerifiableCredential[]
  // Example: ['birthDate', 'degree.type']
  exposedFields: string[]
  // Default value is `true`
  encrypt?: boolean
}
