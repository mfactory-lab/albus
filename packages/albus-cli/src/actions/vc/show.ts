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

    let vcInfo = vc.verifiableCredential.credentialSubject as Record<string, any>
    if (vcInfo.encrypted) {
      vcInfo = JSON.parse(await crypto.xc20p.decrypt(vcInfo.encrypted, keypair.secretKey))
    }

    log.info('Mint:', metadata.mintAddress.toString())
    log.info('VerifiableCredential:', vcInfo)
    log.info('--------------------------------------------------------------------------')
  }
}
