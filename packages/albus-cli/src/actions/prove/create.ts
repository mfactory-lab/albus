import fs from 'node:fs'
import { PublicKey } from '@solana/web3.js'
import log from 'loglevel'
import { snark } from '../../../../albus-core'
import { exploreAddress } from '../../utils'
import { loadCircuit, mintProofNFT } from './utils'

interface Opts {
  // Circuit NFT address
  circuit: string | PublicKey
  // Input signals. Can be path to the file or Map
  input?: string
}

export async function create(opts: Opts) {
  log.debug('Circuit loading...')
  const circuit = await loadCircuit(opts.circuit)

  const input = opts.input ? JSON.parse(fs.readFileSync(opts.input).toString()) : undefined

  log.debug('Generating proof...')
  const { proof, publicSignals } = await snark.generateProof({
    wasmUrl: circuit.wasmUrl,
    zkeyUrl: circuit.zkeyUrl,
    input,
  })

  log.info('Done')
  log.info({ proof, publicSignals })

  log.debug('Minting nft...')
  const nft = await mintProofNFT(new PublicKey(opts.circuit), proof, publicSignals)

  log.info('Done')
  log.info(`Mint: ${nft.address}`)
  log.info(exploreAddress(nft.address))
}
