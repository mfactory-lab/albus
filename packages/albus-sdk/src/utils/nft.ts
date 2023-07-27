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

import * as Albus from '@albus/core'
import type { Creator, Metadata } from '@metaplex-foundation/mpl-token-metadata'
import type { Connection, PublicKeyInitData } from '@solana/web3.js'
import type { AlbusNftCode } from '../types'
import { NFT_AUTHORITY, NFT_SYMBOL_PREFIX } from '../constants'

export interface ValidateNftProps {
  code?: AlbusNftCode
  creators?: Creator[]
}

export function validateNft(nft: Metadata, props: ValidateNftProps = {}) {
  if (nft.updateAuthority.toString() !== NFT_AUTHORITY) {
    throw new Error('Unauthorized NFT.')
  }

  if (props.code) {
    const symbol = `${NFT_SYMBOL_PREFIX}-${props.code}`
    if (nft.data.symbol !== symbol) {
      throw new Error(`Invalid NFT Symbol. Expected: ${symbol}`)
    }
  }

  if (props.creators && !props.creators.every(c => (nft.data.creators ?? []).includes(c))) {
    throw new Error('Invalid NFT creator')
  }
}

/**
 * Load and validate NFT Metadata
 * @private
 */
export async function loadNft(connection: Connection, addr: PublicKeyInitData, validate?: ValidateNftProps) {
  const metadata = await Albus.utils.getMetadataByMint(connection, addr, true)

  if (!metadata) {
    throw new Error(`Unable to find Metadata account at ${addr}`)
  }

  validateNft(metadata, validate)

  return metadata
}
