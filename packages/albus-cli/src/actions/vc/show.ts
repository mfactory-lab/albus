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

import type { JsonMetadata, Metadata } from '@metaplex-foundation/js'
import { MetadataV1GpaBuilder, toMetadata, toMetadataAccount } from '@metaplex-foundation/js'
import { Keypair } from '@solana/web3.js'
import { verifyCredential } from 'did-jwt-vc'
import type { ResolverRegistry } from 'did-resolver'
import { Resolver } from 'did-resolver'
import * as KeyDidResolver from 'key-did-resolver'
import * as WebDidResolver from 'web-did-resolver'
import log from 'loglevel'
import { crypto } from '@albus/core'
import { useContext } from '../../context'

export async function showAll() {
  const { metaplex, keypair, config } = useContext()

  const albusKeypair = Keypair.fromSecretKey(Uint8Array.from(config.issuerSecretKey))

  const gpaBuilder = new MetadataV1GpaBuilder(metaplex)

  log.info('Loading all verifiable credentials...')

  const accounts = await gpaBuilder
    .whereSymbol(`${config.nftSymbol}-VC`)
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

  const resolver = new Resolver({
    ...WebDidResolver.getResolver(),
    ...KeyDidResolver.getResolver(),
  } as ResolverRegistry)

  log.debug('Verifying credential...')

  log.info('--------------------------------------------------------------------------')

  for (const metadata of metadataAccounts) {
    const json = await metaplex.storage().downloadJson<JsonMetadata>(metadata.uri)

    const vc = await verifyCredential(json.vc as string, resolver, {
      audience: config.issuerDid,
    })

    let credentialSubject = vc.verifiableCredential.credentialSubject as Record<string, any>
    if (credentialSubject.encrypted) {
      credentialSubject = JSON.parse(await crypto.xc20p.decrypt(credentialSubject.encrypted, keypair.secretKey))
    }

    log.info('Id:', vc.verifiableCredential.id)
    log.info('MintAddress:', metadata.mintAddress.toString())
    log.info('Issuer:', vc.verifiableCredential.issuer)
    log.info('IssuanceDate:', vc.verifiableCredential.issuanceDate)
    log.info('ExpirationDate:', vc.verifiableCredential.expirationDate)
    log.info('VerifiableCredential:', credentialSubject)

    log.info('--------------------------------------------------------------------------')
  }
}
