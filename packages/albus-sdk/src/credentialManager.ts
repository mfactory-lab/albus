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
import { ComputeBudgetProgram, Keypair, PublicKey, SYSVAR_INSTRUCTIONS_PUBKEY, Transaction } from '@solana/web3.js'
import type { Resolver } from 'did-resolver'
import { BaseManager } from './base'
import { CREDENTIAL_NAME, CREDENTIAL_SYMBOL_CODE, NFT_SYMBOL_PREFIX } from './constants'
import {
  createMintCredentialInstruction,
  createRevokeCredentialInstruction,
  createUpdateCredentialInstruction,
  errorFromCode,
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
    const owner = props?.owner ? new PublicKey(props?.owner) : this.provider.publicKey

    const ix = createMintCredentialInstruction({
      mint: mint.publicKey,
      tokenAccount: getAssociatedTokenAddress(mint.publicKey, owner),
      albusAuthority: this.pda.authority()[0],
      editionAccount: getMasterEditionPDA(mint.publicKey),
      metadataAccount: getMetadataPDA(mint.publicKey),
      authority: this.provider.publicKey,
      metadataProgram: METADATA_PROGRAM_ID,
      sysvarInstructions: SYSVAR_INSTRUCTIONS_PUBKEY,
    }, {
      data: {
        uri: '',
      },
    })

    try {
      const tx = new Transaction()
        .add(ComputeBudgetProgram.setComputeUnitLimit({ units: 300_000 }))
        .add(ix)

      const signers: Signer[] = [mint]
      if (opts?.feePayer) {
        tx.feePayer = opts.feePayer.publicKey
        signers.push(opts.feePayer)
      }

      const signature = await this.provider.sendAndConfirm(tx, signers, { ...this.provider.opts, ...opts?.confirm })
      return { mintAddress: mint.publicKey, signature }
    } catch (e: any) {
      throw errorFromCode(e.code) ?? e
    }
  }

  /**
   * Update credential data.
   * Require admin authority
   */
  async update(props: UpdateCredentialProps, opts?: TxOpts) {
    const mint = new PublicKey(props.mint)
    const owner = new PublicKey(props.owner)

    const ix = createUpdateCredentialInstruction({
      mint,
      albusAuthority: this.pda.authority()[0],
      tokenAccount: getAssociatedTokenAddress(mint, owner),
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

    try {
      const tx = new Transaction().add(ix)
      const signers: Signer[] = []
      if (opts?.feePayer) {
        tx.feePayer = opts.feePayer.publicKey
        signers.push(opts.feePayer)
      }
      const signature = await this.provider.sendAndConfirm(tx, signers, {
        ...this.provider.opts,
        ...opts?.confirm,
      })
      return { signature }
    } catch (e: any) {
      throw errorFromCode(e.code) ?? e
    }
  }

  /**
   * Revoke credential and burn credential NFT.
   */
  async revoke(props: RevokeCredentialProps, opts?: TxOpts) {
    const mint = new PublicKey(props.mint)

    const ix = createRevokeCredentialInstruction({
      mint,
      tokenAccount: getAssociatedTokenAddress(mint, this.provider.publicKey),
      albusAuthority: this.pda.authority()[0],
      editionAccount: getMasterEditionPDA(mint),
      metadataAccount: getMetadataPDA(mint),
      authority: this.provider.publicKey,
      metadataProgram: METADATA_PROGRAM_ID,
      sysvarInstructions: SYSVAR_INSTRUCTIONS_PUBKEY,
    })

    try {
      const tx = new Transaction().add(ix)
      const signers: Signer[] = []
      if (opts?.feePayer) {
        tx.feePayer = opts.feePayer.publicKey
        signers.push(opts.feePayer)
      }
      const signature = await this.provider.sendAndConfirm(tx, signers, {
        ...this.provider.opts,
        ...opts?.confirm,
      })
      return { signature }
    } catch (e: any) {
      throw errorFromCode(e.code) ?? e
    }
  }

  /**
   * Load a credential associated with a specified address.
   * This function retrieves, verifies, and optionally decrypts the credential.
   */
  async load(addr: PublicKeyInitData, props: LoadCredentialProps = { throwOnError: true }) {
    const nft = await loadNft(this.provider.connection, addr, {
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
  owner?: PublicKeyInitData
}

export type UpdateCredentialProps = {
  owner: PublicKeyInitData
  mint: PublicKeyInitData
  uri: string
  name?: string
}

export type RevokeCredentialProps = {
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
