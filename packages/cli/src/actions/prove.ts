import fs from 'fs'
import os from 'os'
import { toBigNumber } from '@metaplex-foundation/js'
import { PublicKey } from '@solana/web3.js'
import log from 'loglevel'
import * as snarkjs from 'snarkjs'
import { useContext } from '../context'
import { downloadFile } from '../utils'

const NFT_SYMBOL = 'ALBS'
const NFT_CREATORS = []

export async function generateProof(opts: any) {
  const { metaplex } = useContext()

  const circuitNft = await metaplex.nfts().findByMint({
    mintAddress: new PublicKey(opts.circuit),
    loadJsonMetadata: true,
  })

  if (!circuitNft.json?.zkey_url || !circuitNft.json?.wasm_url) {
    throw new Error('Invalid circuit')
  }

  const wasmFile = `${os.tmpdir()}/circuit.wasm`
  await downloadFile(String(circuitNft.json.wasm_url), wasmFile)

  const zkeyFile = `${os.tmpdir()}/circuit.zkey`
  await downloadFile(String(circuitNft.json.zkey_url), zkeyFile)

  const input = opts.input ? JSON.parse(fs.readFileSync(opts.input).toString()) : {}

  log.debug('Generate proof...')
  const { proof, publicSignals } = await snarkjs.groth16.fullProve(input, wasmFile, zkeyFile)

  log.info({
    msg: 'Responding with proof and inputs',
    proof,
    publicSignals,
  })

  fs.unlinkSync(wasmFile)
  fs.unlinkSync(zkeyFile)

  // fs.writeFileSync(`${outputPath}/proof.json`, JSON.stringify(proof))
  // fs.writeFileSync(`${outputPath}/public.json`, JSON.stringify(publicSignals))

  // NFT generation

  const name = 'Albus age proof'

  log.info('Uploading NFT metadata...')
  const { uri: metadataUri } = await metaplex
    .nfts()
    .uploadMetadata({
      name,
      proof,
      public_input: publicSignals,
      external_url: 'https://albus.finance',
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
      symbol: NFT_SYMBOL,
      creators: NFT_CREATORS,
      isMutable: true,
      maxSupply: toBigNumber(1),
    })

  log.info('Done')
  log.info(`Mint: ${nft.address}`)

  process.exit(0)
}
