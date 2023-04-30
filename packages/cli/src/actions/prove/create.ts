import { PublicKey } from '@solana/web3.js'
import log from 'loglevel'
import { generateProof, loadCircuit, mintProofNFT } from './utils'

interface Opts {
  // Circuit NFT address
  circuit: string | PublicKey
  // Input signals. Can be path to the file or Map
  input?: string
}

export async function create(opts: Opts) {
  log.debug('Generating proof...')

  const circuit = await loadCircuit(opts.circuit)

  const { proof, publicSignals } = await generateProof({
    wasmUrl: circuit.wasmUrl,
    zkeyUrl: circuit.zkeyUrl,
    inputFile: opts.input,
  })

  log.info('Done')
  log.info({ proof, publicSignals })

  log.debug('Minting nft...')
  const nft = await mintProofNFT(new PublicKey(opts.circuit), proof, publicSignals)

  log.info('Done')
  log.info(`Mint: ${nft.address}`)
}
