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

import { Keypair } from '@solana/web3.js'
import type { JsonMetadata, Metadata } from '@metaplex-foundation/js'
import { MetadataV1GpaBuilder, toMetadata, toMetadataAccount } from '@metaplex-foundation/js'
import log from 'loglevel'
import { exploreAddress } from '@/utils'
import { useContext } from '@/context'

export async function showAll() {
  const { metaplex, config } = useContext()

  const albusKeypair = Keypair.fromSecretKey(Uint8Array.from(config.issuerSecretKey))

  const gpaBuilder = new MetadataV1GpaBuilder(metaplex)

  log.info('Loading all circuits...')

  const accounts = await gpaBuilder
    .whereSymbol(`${config.nftSymbol}-C`)
    .whereUpdateAuthority(albusKeypair.publicKey)
    .get()

  const metadataAccounts = accounts
    .map<Metadata | null>((account) => {
      if (account == null) {
        return null
      }
      try {
        return toMetadata(toMetadataAccount(account))
      } catch (error) {
        return null
      }
    })
    .filter((nft): nft is Metadata => nft !== null)

  log.debug('Circuits...')

  log.info('--------------------------------------------------------------------------')

  for (const metadata of metadataAccounts) {
    const json = await metaplex.storage().downloadJson<JsonMetadata>(metadata.uri)

    log.info('MintAddress:', metadata.mintAddress.toString())
    log.info('ExploreLink:', exploreAddress(metadata.mintAddress))
    log.info('Metadata', json)

    log.info('--------------------------------------------------------------------------')
  }
}
