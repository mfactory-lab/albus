import { PublicKey } from '@solana/web3.js'
import { verifyCredential } from 'did-jwt-vc'
import type { ResolverRegistry } from 'did-resolver'
import { Resolver } from 'did-resolver'
import log from 'loglevel'
import * as WebDidResolver from 'web-did-resolver'
import * as KeyDidResolver from 'key-did-resolver'
import { crypto, snark } from '@albus/core'
import { useContext } from '../../context'
import { exploreAddress } from '../../utils'
import { loadCircuit, loadCredential, mintProofNFT } from './utils'

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

  const reqAddr = new PublicKey(addr)
  const req = await client.loadZKPRequest(reqAddr)

  if (req.proof && opts.force !== true) {
    throw new Error('Proof already exists')
  }

  log.debug(`Loading credential ${opts.vc}...`)
  const cred = await loadCredential(opts.vc)

  const resolver = new Resolver({
    ...WebDidResolver.getResolver(),
    ...KeyDidResolver.getResolver(),
  } as ResolverRegistry)

  log.debug('Verifying credential...')
  const vc = await verifyCredential(cred.payload, resolver, {
    audience: config.issuerDid,
  })

  let vcInfo = vc.verifiableCredential.credentialSubject as Record<string, any>
  if (vcInfo.encrypted) {
    vcInfo = JSON.parse(await crypto.xc20p.decrypt(vcInfo.encrypted, keypair.secretKey))
  }

  log.debug('Generating proof...')

  const circuit = await loadCircuit(req.circuit)

  const { proof, publicSignals } = await snark.generateProof({
    wasmUrl: circuit.wasmUrl,
    zkeyUrl: circuit.zkeyUrl,
    input: prepareCircuitInput(circuit.id, vcInfo),
  })

  log.debug('Done')
  log.info({ publicSignals })

  log.debug('Minting nft...')
  const nft = await mintProofNFT(req.circuit, proof, publicSignals)

  log.debug('Done')
  log.info(`Mint: ${nft.address}`)
  log.info(exploreAddress(nft.address))

  // Mark zkp-request as proved
  await client.prove({ zkpRequest: reqAddr, proofMetadata: nft.metadataAddress })
}

/**
 * Generate input signals for selected circuit
 * TODO: refactory
 */
function prepareCircuitInput(circuitId: string, payload: Record<string, any>): Record<string, any> {
  switch (circuitId) {
    case 'age': {
      const birthDate = String(payload.birthDate).split('-')
      if (birthDate.length !== 3) {
        throw new Error('Invalid `birthDate` attribute')
      }
      const date = new Date()
      return {
        birthDate,
        currentDate: [date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate()],
        minAge: 18,
        maxAge: 120,
      }
    }
    case 'europe':
      if (payload.country) {
        throw new Error('Invalid `country` attribute')
      }
      // TODO: convert `payload.country` to country number code
      return {
        country: 123,
      }
  }
  throw new Error(`Invalid circuit ${circuitId}`)
}
