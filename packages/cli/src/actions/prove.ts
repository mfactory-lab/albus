import fs from 'node:fs'
import os from 'node:os'
import { toBigNumber } from '@metaplex-foundation/js'
import { PublicKey } from '@solana/web3.js'
import log from 'loglevel'
import * as snarkjs from 'snarkjs'
import { useContext } from '../context'
import { downloadFile } from '../utils'

interface GenerateProofOpts {
  // Circuit NFT address
  circuit: string
  // Path to input json file
  input: string
}

/**
 * Generate new proof NFT
 */
export async function generateProof(opts: GenerateProofOpts) {
  const { metaplex, config } = useContext()

  const circuitNft = await metaplex.nfts().findByMint({
    mintAddress: new PublicKey(opts.circuit),
    loadJsonMetadata: true,
  })

  if (!circuitNft.json?.zkey_url) {
    throw new Error('Invalid circuit, `zkey_url` is undefined')
  }

  if (!circuitNft.json?.wasm_url) {
    throw new Error('Invalid circuit, `wasm_url` is undefined')
  }

  log.debug('Downloading wasm file...')
  const wasmFile = `${os.tmpdir()}/circuit.wasm`
  await downloadFile(String(circuitNft.json.wasm_url), wasmFile)

  log.debug('Downloading zkey file...')
  const zkeyFile = `${os.tmpdir()}/circuit.zkey`
  await downloadFile(String(circuitNft.json.zkey_url), zkeyFile)

  const input = opts.input ? JSON.parse(fs.readFileSync(opts.input).toString()) : {}

  log.debug('Generate proof...')
  const { proof, publicSignals } = await snarkjs.groth16.fullProve(input, wasmFile, zkeyFile)

  log.info('Done', { proof, publicSignals })

  fs.unlinkSync(wasmFile)
  fs.unlinkSync(zkeyFile)

  // fs.writeFileSync(`${outputPath}/proof.json`, JSON.stringify(proof))
  // fs.writeFileSync(`${outputPath}/public.json`, JSON.stringify(publicSignals))

  // NFT generation

  const name = 'ALBUS Age Proof'

  log.info('Uploading NFT metadata...')
  const { uri: metadataUri } = await metaplex
    .nfts()
    .uploadMetadata({
      name,
      proof,
      public_input: publicSignals,
      external_url: config.nftExternalUrl,
    })
  log.info('Done')
  log.info(`Metadata uri: ${metadataUri}`)

  log.info('Minting new NFT...')
  const { nft } = await metaplex
    .nfts()
    .create({
      uri: metadataUri,
      name,
      sellerFeeBasisPoints: 0,
      symbol: config.nftSymbol,
      creators: config.nftCreators,
      isMutable: true,
      maxSupply: toBigNumber(1),
    })

  log.info('Done')
  log.info(`Mint: ${nft.address}`)

  process.exit(0)
}
