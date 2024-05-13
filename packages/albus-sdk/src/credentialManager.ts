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
import type {
  ClientSubscriptionId,
  PublicKeyInitData,
} from '@solana/web3.js'
import {
  ComputeBudgetProgram,

  Keypair,
  PublicKey,
  SYSVAR_INSTRUCTIONS_PUBKEY,
} from '@solana/web3.js'
import type { Resolver } from 'did-resolver'
import { BaseManager } from './base'
import {
  CREDENTIAL_NAME,
  CREDENTIAL_SYMBOL_CODE,
  NFT_SYMBOL_PREFIX,
} from './constants'
import {
  createCreateCredentialInstruction, createDeleteCredentialInstruction, createUpdateCredentialInstruction,
} from './generated'
import type { ExtendedMetadata, SendOpts } from './utils'
import {
  getAssociatedTokenAddress,
  getMasterEditionPDA, getMetadataByAccountInfo,
  getMetadataPDA,
  getParsedNftAccountsByOwner,
  loadNft,
} from './utils'

export class CredentialManager extends BaseManager {
  private subscriptions = new Map<string, ClientSubscriptionId>()

  /**
   * Register a callback to be invoked whenever the credential account changes
   */
  async addListener(mint: PublicKeyInitData, callback: CredentialChangeCallback, props?: LoadCredentialProps) {
    const mintPubkey = new PublicKey(mint)
    const key = String(mintPubkey)
    await this.removeListener(key)
    this.subscriptions[key] = this.provider.connection
      .onAccountChange(getMetadataPDA(mint), async (acc) => {
        const metadata = await getMetadataByAccountInfo(acc, true)
        const credentialInfo = await getCredentialInfo(metadata, props)
        callback(credentialInfo, mintPubkey)
      })
  }

  /**
   * Deregister an account notification callback
   */
  removeListener(mint: PublicKeyInitData) {
    const key = String(new PublicKey(mint))
    if (this.subscriptions.has(key)) {
      return this.provider.connection.removeAccountChangeListener(this.subscriptions[key])
    }
  }

  /**
   * Deregister all callbacks
   */
  async removeAllListener() {
    for (const subscriptionId of this.subscriptions.values()) {
      await this.provider.connection.removeAccountChangeListener(subscriptionId)
    }
  }

  /**
   * Create credential instruction.
   */
  createIx(props?: CreateCredentialProps) {
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
    }, this.programId)

    return {
      mint,
      instructions: [ix],
    }
  }

  /**
   * Create new Credential NFT.
   */
  async create(props?: CreateCredentialProps, opts?: SendOpts) {
    const { mint, instructions } = this.createIx(props)

    const builder = this.txBuilder
      .addInstruction(ComputeBudgetProgram.setComputeUnitLimit({ units: 300_000 }))
      .addInstruction(...instructions)
      .addSigner(mint)

    if (props?.owner) {
      builder.addSigner(props.owner)
    }

    const signature = await builder.sendAndConfirm(opts)

    return { mintAddress: mint.publicKey, signature }
  }

  /**
   * Update credential instruction.
   */
  async updateIx(props: UpdateCredentialProps) {
    // const owner = new PublicKey(props.owner)
    // const tokenAccount = getAssociatedTokenAddress(mint, owner)

    let mint: PublicKey | undefined
    let credentialRequest: PublicKey | undefined
    let credentialRequestIssuer: PublicKey | undefined
    if (props.credentialRequest) {
      credentialRequest = new PublicKey(props.credentialRequest)
      const credentialRequestAccount = await this.client.credentialRequest.load(credentialRequest)
      credentialRequestIssuer = credentialRequestAccount.issuer
      mint = credentialRequestAccount.credentialMint
    } else {
      if (!props.mint) {
        throw new Error('Missing mint address')
      }
      mint = new PublicKey(props.mint)
    }

    const ix = createUpdateCredentialInstruction({
      mint,
      // tokenAccount,
      credentialRequest,
      credentialRequestIssuer,
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
    }, this.programId)

    return {
      instructions: [ix],
    }
  }

  /**
   * Update credential data.
   */
  async update(props: UpdateCredentialProps, opts?: SendOpts) {
    const { instructions } = await this.updateIx(props)

    const signature = await this.txBuilder
      .addInstruction(...instructions)
      .sendAndConfirm(opts)

    return { signature }
  }

  /**
   * Delete credential instruction.
   */
  deleteIx(props: DeleteCredentialProps) {
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
    }, this.programId)

    return {
      instructions: [ix],
    }
  }

  /**
   * Delete credential and burn credential NFT.
   */
  async delete(props: DeleteCredentialProps, opts?: SendOpts) {
    const { instructions } = this.deleteIx(props)

    const builder = this.txBuilder
      .addInstruction(...instructions)

    if (props?.owner) {
      builder.addSigner(props.owner)
    }

    const signature = await builder.sendAndConfirm(opts)

    return { signature }
  }

  /**
   * Load credential associated with a specified address.
   */
  async load(mintAddr: PublicKeyInitData, props: LoadCredentialProps = { throwOnError: true }) {
    const nft = await loadNft(this.provider.connection, mintAddr, {
      authority: this.pda.authority()[0],
      code: CREDENTIAL_SYMBOL_CODE,
    })
    return getCredentialInfo(nft, props)
  }

  /**
   * Load all credentials for the provided owner.
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
        credential: await getCredentialInfo(account, props),
      })
    }
    return result
  }
}

/**
 * Get credential info, verify and decrypt if necessary.
 */
async function getCredentialInfo(nft: ExtendedMetadata, props?: LoadCredentialProps) {
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

/**
 * Callback function for credential change notifications
 */
type CredentialChangeCallback = (vc: VerifiableCredential, mint: PublicKey) => void

export type CredentialInfo = {
  address: PublicKey
  credential: VerifiableCredential & { data?: Record<string, string> }
}

export type CreateCredentialProps = {
  owner?: Keypair
}

export type UpdateCredentialProps = {
  uri: string
  name?: string
  // Mint required if credential request is not provided
  mint?: PublicKeyInitData
  // Optional credential request associated with issuer
  credentialRequest?: PublicKeyInitData
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
