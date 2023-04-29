import fs from 'node:fs'
import os from 'node:os'
import { toBigNumber } from '@metaplex-foundation/js'
import type { PublicKeyInitData } from '@solana/web3.js'
import { PublicKey } from '@solana/web3.js'
import log from 'loglevel'
import * as snarkjs from 'snarkjs'
import type { PublicSignals, SnarkjsProof } from 'snarkjs'
import { useContext } from '../../context'
import { downloadFile } from '../../utils'

/**
 * Load and validate Circuit
 */
export async function loadCircuit(addr: PublicKeyInitData) {
  const { metaplex, config } = useContext()

  const nft = await metaplex.nfts().findByMint({
    mintAddress: new PublicKey(addr),
    loadJsonMetadata: true,
  })

  if (nft.symbol !== `${config.nftSymbol}-C`) {
    throw new Error('Invalid circuit! Bad symbol')
  }

  if (!nft.json?.zkey_url) {
    throw new Error('Invalid circuit! `zkey_url` is undefined')
  }

  if (!nft.json?.wasm_url) {
    throw new Error('Invalid circuit! `wasm_url` is undefined')
  }

  return {
    address: nft.address,
    wasmUrl: String(nft.json?.wasm_url),
    zkeyUrl: String(nft.json?.zkey_url),
  }
}

/**
 * Load and validate VC
 */
export async function loadCredential(addr: PublicKeyInitData) {
  const { metaplex, config } = useContext()

  const nft = await metaplex.nfts().findByMint({
    mintAddress: new PublicKey(addr),
    loadJsonMetadata: true,
  })

  if (nft.symbol !== `${config.nftSymbol}-VC`) {
    throw new Error('Invalid circuit! Bad symbol')
  }

  if (!nft.json?.vc) {
    throw new Error('Invalid circuit! `vc` is undefined')
  }

  return {
    address: nft.address,
    payload: nft.json.vc as string,
  }
}

/**
 * Mint `Proof` NFT
 */
export async function mintProofNFT(circuit: PublicKey, proof: SnarkjsProof, publicSignals: PublicSignals) {
  const { metaplex, config } = useContext()
  log.info('Uploading NFT metadata...')

  // TODO: Generate name by circuit ? Example: `ALBUS Age Proof`
  const name = 'ALBUS Proof'

  const { uri: metadataUri } = await metaplex
    .nfts()
    .uploadMetadata({
      name,
      image: config.logoUrl,
      external_url: config.nftExternalUrl,
      circuit: circuit.toBase58(),
      public_input: publicSignals,
      proof,
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
      symbol: `${config.nftSymbol}-P`,
      creators: config.nftCreators,
      isMutable: true,
      maxSupply: toBigNumber(1),
    })

  return nft
}

/**
 * Create new Proof
 */
export async function generateProof(circuitAddr: PublicKeyInitData, input?: string | Object) {
  const circuit = await loadCircuit(circuitAddr)

  log.debug('Downloading wasm file...')
  const wasmFile = `${os.tmpdir()}/circuit.wasm`
  await downloadFile(circuit.wasmUrl, wasmFile)

  log.debug('Downloading zkey file...')
  const zkeyFile = `${os.tmpdir()}/circuit.zkey`
  await downloadFile(circuit.zkeyUrl, zkeyFile)

  let inputSignals = {}
  if (input) {
    if (typeof input === 'string') {
      inputSignals = JSON.parse(fs.readFileSync(input).toString())
    } else {
      inputSignals = input
    }
  }

  const { proof, publicSignals }
    = await snarkjs.groth16.fullProve(inputSignals, wasmFile, zkeyFile)

  fs.unlinkSync(wasmFile)
  fs.unlinkSync(zkeyFile)

  return { proof, publicSignals }
}
