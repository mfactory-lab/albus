import type { ZKPRequest } from '@albus/sdk'
import { PublicKey } from '@solana/web3.js'
import { verifyCredential } from 'did-jwt-vc'
import type { ResolverRegistry } from 'did-resolver'
import { Resolver } from 'did-resolver'
import log from 'loglevel'
import { crypto } from '@albus/core'
import * as WebDidResolver from 'web-did-resolver'
import * as KeyDidResolver from 'key-did-resolver'
import { useContext } from '../../context'
import { generateProof, loadCredential, mintProofNFT } from './utils'

interface Opts {
  // Verifiable Credential Address
  vc: string
  // Override if exists
  force?: boolean
}

/**
 * Create proof for ZKP request
 */
export async function createForRequest(addr: string, opts: Opts) {
  const { keypair, client, config } = useContext()

  // const reqAddr = new PublicKey(addr)
  // const req = await client.loadZKPRequest(reqAddr)
  //
  // if (req.proof && opts.force !== true) {
  //   throw new Error('Proof already exists')
  // }

  const reqAddr = PublicKey.default
  const req = {} as ZKPRequest

  log.info(`Loading credential ${opts.vc}...`)
  const cred = await loadCredential(opts.vc)

  const resolver = new Resolver({
    // Prepare the did:web resolver
    ...WebDidResolver.getResolver(),
    ...KeyDidResolver.getResolver(),
  } as ResolverRegistry)

  const vc = await verifyCredential(cred.payload, resolver, {
    audience: config.issuerDid,
  })

  let vcInfo = vc.verifiableCredential.credentialSubject as Record<string, any>
  if (vcInfo.encrypted) {
    vcInfo = JSON.parse(await crypto.xc20p.decrypt(vcInfo.encrypted, keypair.secretKey))
  }

  console.log(vcInfo)
  return

  log.debug('Generating proof...')
  const { proof, publicSignals } = await generateProof(req.circuit, {
    a: 1,
  })

  log.info('Done')
  log.info({ proof, publicSignals })

  log.debug('Minting nft...')
  const nft = await mintProofNFT(req.circuit, proof, publicSignals)

  log.info('Done')
  log.info(`Mint: ${nft.address}`)

  // Mark zkp-request as proved
  await client.prove({ zkpRequest: reqAddr, proofMetadata: nft.metadataAddress })
}
