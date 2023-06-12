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
import type { FindNftByMetadataOutput } from '@metaplex-foundation/js'
import { PublicKey } from '@solana/web3.js'
import { NFT_AUTHORITY, NFT_SYMBOL_PREFIX } from '../constants'

const METADATA_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s')

export function getMetadataPDA(mint: PublicKey): PublicKey {
  const [publicKey] = PublicKey.findProgramAddressSync(
    [Buffer.from('metadata'), METADATA_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    METADATA_PROGRAM_ID,
  )
  return publicKey
}

export function validateNft(nft: FindNftByMetadataOutput, props: { code?: string } = {}) {
  if (nft.updateAuthorityAddress.toString() !== NFT_AUTHORITY) {
    throw new Error('Unauthorized NFT.')
  }

  // check creators ?

  if (props.code) {
    const symbol = `${NFT_SYMBOL_PREFIX}-${props.code}`
    if (nft.symbol !== symbol) {
      throw new Error(`Invalid NFT Symbol. Expected: ${symbol}`)
    }
  }
}
