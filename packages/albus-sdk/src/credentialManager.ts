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
import type { VerifiableCredential } from '@mfactory-lab/albus-core'
import * as Albus from '@mfactory-lab/albus-core'
import type { AnchorProvider } from '@coral-xyz/anchor'
import { ComputeBudgetProgram, Keypair, PublicKey, SYSVAR_INSTRUCTIONS_PUBKEY, Transaction } from '@solana/web3.js'
import type { ConfirmOptions, PublicKeyInitData } from '@solana/web3.js'
import axios from 'axios'
import { DEFAULT_CREDENTIAL_NAME, NFT_SYMBOL_PREFIX, NFT_VC_SYMBOL } from './constants'
import {
  createMintCredentialInstruction, createRevokeCredentialInstruction, createUpdateCredentialInstruction,
  errorFromCode,
} from './generated'

import type { PdaManager } from './pda'
import {
  getAssociatedTokenAddress,
  getMasterEditionPDA,
  getMetadataPDA,
  getParsedNftAccountsByOwner,
  loadNft,
} from './utils'

export class CredentialManager {
  constructor(
    readonly provider: AnchorProvider,
    readonly pda: PdaManager,
  ) {
  }

  /**
   * Create new Credential NFT
   */
  async create(_props: CreateCredentialProps = {}, opts?: ConfirmOptions) {
    const mint = Keypair.generate()

    const token = getAssociatedTokenAddress(mint.publicKey, this.provider.publicKey)

    const ix = createMintCredentialInstruction({
      tokenAccount: token,
      sysvarInstructions: SYSVAR_INSTRUCTIONS_PUBKEY,
      mint: mint.publicKey,
      albusAuthority: this.pda.authority()[0],
      editionAccount: getMasterEditionPDA(mint.publicKey),
      metadataAccount: getMetadataPDA(mint.publicKey),
      metadataProgram: METADATA_PROGRAM_ID,
      authority: this.provider.publicKey,
    }, {
      data: {
        uri: '',
      },
    })

    try {
      const tx = new Transaction()
        .add(ComputeBudgetProgram.setComputeUnitLimit({ units: 300_000 }))
        .add(ix)
      const signature = await this.provider.sendAndConfirm(tx, [mint], { ...this.provider.opts, ...opts })
      return { mintAddress: mint.publicKey, signature }
    } catch (e: any) {
      throw errorFromCode(e.code) ?? e
    }
  }

  /**
   * Revoke credential and burn credential NFT
   */
  async revoke(props: RevokeCredentialProps, opts?: ConfirmOptions) {
    const authority = this.provider.publicKey
    const mint = new PublicKey(props.mint)
    const token = getAssociatedTokenAddress(mint, authority)

    const ix = createRevokeCredentialInstruction({
      tokenAccount: token,
      mint,
      albusAuthority: this.pda.authority()[0],
      editionAccount: getMasterEditionPDA(mint),
      metadataAccount: getMetadataPDA(mint),
      metadataProgram: METADATA_PROGRAM_ID,
      sysvarInstructions: SYSVAR_INSTRUCTIONS_PUBKEY,
      authority,
    })

    try {
      const tx = new Transaction().add(ix)
      const signature = await this.provider.sendAndConfirm(tx, [], { ...this.provider.opts, ...opts })
      return { signature }
    } catch (e: any) {
      throw errorFromCode(e.code) ?? e
    }
  }

  /**
   * Update credential data
   * Require admin authority
   */
  async update(props: UpdateCredentialProps, opts?: ConfirmOptions) {
    const authority = this.provider.publicKey
    const mint = new PublicKey(props.mint)
    const token = getAssociatedTokenAddress(mint, authority)

    const ix = createUpdateCredentialInstruction({
      albusAuthority: this.pda.authority()[0],
      mint,
      tokenAccount: token,
      metadataAccount: getMetadataPDA(mint),
      metadataProgram: METADATA_PROGRAM_ID,
      sysvarInstructions: SYSVAR_INSTRUCTIONS_PUBKEY,
      authority,
    }, {
      data: {
        name: props.name ?? DEFAULT_CREDENTIAL_NAME,
        uri: props.uri,
      },
    })

    try {
      const tx = new Transaction().add(ix)
      const signature = await this.provider.sendAndConfirm(tx, [], { ...this.provider.opts, ...opts })
      return { signature }
    } catch (e: any) {
      throw errorFromCode(e.code) ?? e
    }
  }

  /**
   * Load a verifiable credential associated with a specified address.
   * This function retrieves, verifies, and optionally decrypts the credential.
   *
   * @param {PublicKeyInitData} addr - The address associated with the verifiable credential.
   * @param {LoadCredentialProps} [props] - Optional properties for loading and processing the credential.
   * @returns {Promise<VerifiableCredential>} A Promise that resolves to the verified and, if necessary, decrypted Verifiable Credential.
   * @throws {Error} Throws an error if the loaded credential is invalid or does not contain the `vc` attribute in its metadata.
   */
  async load(addr: PublicKeyInitData, props: LoadCredentialProps = {}) {
    const nft = await loadNft(this.provider.connection, addr, {
      authority: this.pda.authority()[0],
      code: NFT_VC_SYMBOL,
    })

    if (!nft.json?.vc) {
      throw new Error('Invalid credential! Metadata does not contain `vc` attribute.')
    }

    return Albus.credential.verifyCredential(nft.json.vc, {
      // audience: ALBUS_DID,
      decryptionKey: props.decryptionKey,
    })
  }

  /**
   * Load all verifiable credentials
   * @param props
   */
  async loadAll(props: LoadAllCredentialProps = {}) {
    const accounts = await getParsedNftAccountsByOwner(
      this.provider.connection,
      props.owner ?? this.provider.publicKey,
      {
        symbol: `${NFT_SYMBOL_PREFIX}-${NFT_VC_SYMBOL}`,
        updateAuthority: this.pda.authority()[0],
        withJson: true,
      },
    )

    const result: { address: PublicKey; credential: VerifiableCredential }[] = []
    for (const account of accounts) {
      if (account.json?.vc !== undefined) {
        const credential = await Albus.credential.verifyCredential(account.json.vc, {
          // audience: ALBUS_DID,
          decryptionKey: props.decryptionKey,
        })
        result.push({ address: account.mint, credential })
      }
    }

    return result
  }

  /**
   * Load a verifiable presentation from a specified URI, verify, and optionally decrypt it.
   *
   * @param {string} uri - The URI from which to retrieve the verifiable presentation.
   * @param {LoadPresentationProps} [props] - Optional properties for loading and processing the presentation.
   * @returns {Promise<object>} A Promise that resolves to the loaded, verified, and, if necessary, decrypted verifiable presentation.
   * @throws {Error} Throws an error if there is an issue loading the presentation, if it fails verification, or if decryption fails.
   */
  async loadPresentation(uri: string, props: LoadPresentationProps = {}) {
    const presentation = (await axios.get(uri)).data

    await Albus.credential.verifyPresentation(presentation, {
      decryptionKey: props.decryptionKey,
    })

    return presentation
  }

  /**
   * Create a new verifiable presentation
   * encrypted with a shared key
   * @param props
   */
  async createPresentation(props: CreatePresentationProps) {
    return Albus.credential.createVerifiablePresentation({
      holderSecretKey: props.holderSecretKey,
      exposedFields: props.exposedFields,
      credentials: props.credentials,
    })
  }
}

export interface CreateCredentialProps {

}

export interface UpdateCredentialProps {
  mint: PublicKeyInitData
  uri: string
  name?: string
}

export interface RevokeCredentialProps {
  mint: PublicKeyInitData
}

export interface LoadCredentialProps {
  decryptionKey?: number[] | Uint8Array
}

export interface LoadAllCredentialProps extends LoadCredentialProps {
  owner?: PublicKey
}

export interface LoadPresentationProps extends LoadCredentialProps {
}

export interface CreatePresentationProps {
  holderSecretKey: number[] | Uint8Array
  credentials: VerifiableCredential[]
  // Example: ['birthDate', 'degree.type']
  exposedFields: string[]
  // Default value is `true`
  encrypt?: boolean
}
