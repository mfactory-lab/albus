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

import type { VerifiableCredential } from '@albus/core'
import * as Albus from '@albus/core'
import type { AnchorProvider } from '@coral-xyz/anchor'
import type { PublicKeyInitData } from '@solana/web3.js'
import { Keypair } from '@solana/web3.js'
import axios from 'axios'
import type { PrivateKey } from './types'
import { ALBUS_DID, NFT_AUTHORITY, NFT_SYMBOL_PREFIX } from './constants'

import type { PdaManager } from './pda'
import { getParsedNftAccountsByOwner, loadNft } from './utils'

export class CredentialManager {
  constructor(
    readonly provider: AnchorProvider,
    readonly pda: PdaManager,
  ) {
  }

  /**
   * Load verifiable credential by {@link addr}
   * verify and decrypt if needed
   */
  async load(addr: PublicKeyInitData, props: LoadCredentialProps = {}) {
    const nft = await loadNft(this.provider.connection, addr, { code: 'VC' })

    if (!nft.json?.vc) {
      throw new Error('Invalid credential! Metadata does not contain `vc` attribute.')
    }

    return Albus.credential.verifyCredential(nft.json.vc, {
      audience: ALBUS_DID,
      decryptionKey: props.decryptionKey,
    })
  }

  /**
   * Load all verifiable credentials
   */
  async loadAll() {
    const accounts = await getParsedNftAccountsByOwner(
      this.provider.connection,
      this.provider.publicKey,
      {
        symbol: `${NFT_SYMBOL_PREFIX}-VC`,
        updateAuthority: NFT_AUTHORITY,
        withJson: true,
      },
    )

    console.log(accounts)

    for (const account of accounts) {
      if (account.json?.vc !== undefined) {
        // ..
      }
    }

    return []
  }

  /**
   * Load verifiable presentation
   * verify and decrypt if needed
   */
  async loadPresentation(uri: string, props: LoadPresentationProps = {}) {
    const presentation = (await axios.get(uri)).data

    await Albus.credential.verifyPresentation(presentation, {
      decryptionKey: props.decryptionKey,
    })

    return presentation
  }

  /**
   * Create new verifiable presentation
   * encrypted with shared key
   */
  async createPresentation(props: CreatePresentationProps) {
    const sharedKey = Keypair.generate().secretKey

    // TODO: split sharedKey
    // TODO: save shares

    return Albus.credential.createVerifiablePresentation({
      holderSecretKey: props.holderSecretKey,
      exposedFields: props.exposedFields,
      credentials: props.credentials,
    })
  }
}

export interface LoadCredentialProps {
  decryptionKey?: PrivateKey
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
