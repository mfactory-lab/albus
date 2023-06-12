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

import { Buffer } from 'node:buffer'
import axios from 'axios'
import { PROGRAM_ID as METADATA_PROGRAM_ID, Metadata } from '@metaplex-foundation/mpl-token-metadata'
import type { Connection, PublicKeyInitData } from '@solana/web3.js'
import { PublicKey } from '@solana/web3.js'
import { NFT_AUTHORITY, NFT_SYMBOL_PREFIX } from '../constants'

type ExtendedMetadata = Metadata & { json: Record<string, any> }

export function getMetadataPDA(mint: PublicKeyInitData): PublicKey {
  const [publicKey] = PublicKey.findProgramAddressSync(
    [Buffer.from('metadata'), METADATA_PROGRAM_ID.toBuffer(), new PublicKey(mint).toBuffer()],
    METADATA_PROGRAM_ID,
  )
  return publicKey
}

export async function getMetadataByMint(connection: Connection, mint: PublicKeyInitData, loadJson = false) {
  const accountInfo = await connection.getAccountInfo(getMetadataPDA(mint))
  if (accountInfo) {
    const metadata = sanitizeMetadata(Metadata.fromAccountInfo(accountInfo)[0]) as ExtendedMetadata
    if (loadJson) {
      try {
        metadata.json = (await axios.get(metadata.data.uri)).data
      } catch (e) {
        console.log('Error: Failed to load nft metadata')
        metadata.json = {}
      }
    }
    return metadata
  }
}

export function validateNft(nft: Metadata, props: { code?: string } = {}) {
  if (nft.updateAuthority.toString() !== NFT_AUTHORITY) {
    throw new Error('Unauthorized NFT.')
  }

  // check creators ?

  if (props.code) {
    const symbol = `${NFT_SYMBOL_PREFIX}-${props.code}`
    if (nft.data.symbol !== symbol) {
      throw new Error(`Invalid NFT Symbol. Expected: ${symbol}`)
    }
  }
}

// Remove all empty space, new line, etc. symbols
// In some reason such symbols parsed back from Buffer looks weird
// like "\x0000" instead of usual spaces.
export const sanitizeString = (str: string) => str.replace(/\0/g, '')

function sanitizeMetadata(tokenData: Metadata) {
  return ({
    ...tokenData,
    data: {
      ...tokenData?.data,
      name: sanitizeString(tokenData?.data?.name),
      symbol: sanitizeString(tokenData?.data?.symbol),
      uri: sanitizeString(tokenData?.data?.uri),
    },
  }) as Metadata
}
