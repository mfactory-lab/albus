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

import { vc } from '@albus/core'
import type { JsonMetadata, Metadata } from '@metaplex-foundation/js'
import { MetadataV1GpaBuilder, TokenGpaBuilder, toMetadata, toMetadataAccount } from '@metaplex-foundation/js'
import type { PublicKey } from '@solana/web3.js'
import log from 'loglevel'
import { useContext } from '../../context'

export async function showAll() {
  const { metaplex, issuerKeypair, config } = useContext()

  const gpaBuilder = new MetadataV1GpaBuilder(metaplex)

  log.info('Loading token accounts...')
  const tokenMints = (await getTokenMints()).map(String)
  log.info(`Found ${tokenMints.length} tokens`)

  log.info('Loading all verifiable credentials...')
  const accounts = await gpaBuilder
    .whereSymbol(`${config.nftSymbol}-VC`)
    .whereUpdateAuthority(issuerKeypair.publicKey)
    // .whereCreator(2, keypair.publicKey)
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
    .filter((nft): nft is Metadata => nft !== null
      && tokenMints.includes(nft.mintAddress.toString()))

  if (metadataAccounts.length > 0) {
    log.info('--------------------------------------------------------------------------')
    for (const metadata of metadataAccounts) {
      log.info('Address:', metadata.mintAddress.toString())
      await showCredentialInfo(metadata)
      log.info('--------------------------------------------------------------------------')
    }
  } else {
    log.info('No data found')
  }
}

async function showCredentialInfo(metadata: Metadata) {
  const { metaplex, keypair, config } = useContext()

  if (!metadata.uri) {
    log.warn('Invalid nft')
    return
  }

  try {
    const json = await metaplex.storage().downloadJson<JsonMetadata>(metadata.uri)

    const { verifiableCredential } = await vc.verifyCredential(json.vc as string, {
      decryptionKey: keypair.secretKey,
      audience: config.issuerDid,
    })

    log.info('Issuer:', verifiableCredential.issuer)
    log.info('IssuanceDate:', verifiableCredential.issuanceDate)
    log.info('ExpirationDate:', verifiableCredential.expirationDate)
    log.info('CredentialSubject:', verifiableCredential.credentialSubject)
  } catch (e) {
    log.error(e)
  }
}

async function getTokenMints(): Promise<PublicKey[]> {
  const { metaplex, keypair } = useContext()
  const tokenProgram = metaplex.programs().getToken()
  return new TokenGpaBuilder(metaplex, tokenProgram.address)
    .selectMint()
    .whereOwner(keypair.publicKey)
    .whereAmount(1)
    .getDataAsPublicKeys()
}
