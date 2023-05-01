import fs from 'node:fs'
import os from 'node:os'
import { toBigNumber } from '@metaplex-foundation/js'
import type { PublicKeyInitData } from '@solana/web3.js'
import { Keypair, PublicKey } from '@solana/web3.js'
import log from 'loglevel'
import * as snarkjs from 'snarkjs'
import type { PublicSignals, SnarkjsProof } from 'snarkjs'
import { useContext } from '../../context'
import { downloadFile } from '../../utils'

/**
 * Load and validate Circuit NFT
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

  if (!nft.json?.circuit_id) {
    throw new Error('Invalid circuit! Metadata does not contain `circuit_id`')
  }

  if (!nft.json?.zkey_url) {
    throw new Error('Invalid circuit! Metadata does not contain `zkey_url`')
  }

  if (!nft.json?.wasm_url) {
    throw new Error('Invalid circuit! Metadata does not contain `wasm_url`')
  }

  if (!nft.json?.vk) {
    throw new Error('Invalid circuit! Metadata does not contain verification key.')
  }

  return {
    address: nft.address,
    id: String(nft.json.circuit_id),
    vk: nft.json.vk as snarkjs.VK,
    wasmUrl: String(nft.json.wasm_url),
    zkeyUrl: String(nft.json.zkey_url),
  }
}

/**
 * Load and validate VC NFT
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
 * Load and validate Proof NFT
 */
export async function loadProof(addr: PublicKeyInitData) {
  const { metaplex, config } = useContext()

  const nft = await metaplex.nfts().findByMint({
    mintAddress: new PublicKey(addr),
    loadJsonMetadata: true,
  })

  if (nft.symbol !== `${config.nftSymbol}-P`) {
    throw new Error('Invalid proof! Bad symbol')
  }

  if (!nft.json?.proof) {
    throw new Error('Invalid proof! Metadata does not contain proof info.')
  }

  return {
    address: nft.address,
    circuit: nft.json.circuit,
    proofData: nft.json.proof as snarkjs.SnarkjsProof,
    publicInput: (nft.json.public_input ?? []) as snarkjs.PublicSignals,
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

  const updateAuthority = Keypair.fromSecretKey(Uint8Array.from(config.issuerSecretKey))

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
      updateAuthority,
      maxSupply: toBigNumber(1),
    })

  return nft
}

interface GenerateProofProps {
  wasmUrl: string
  zkeyUrl: string
  input?: { [key: string]: any }
  inputFile?: string
}

/**
 * Create new Proof
 */
export async function generateProof(props: GenerateProofProps) {
  log.debug('Downloading wasm file...')
  const wasmFile = `${os.tmpdir()}/circuit.wasm`
  await downloadFile(props.wasmUrl, wasmFile)

  log.debug('Downloading zkey file...')
  const zkeyFile = `${os.tmpdir()}/circuit.zkey`
  await downloadFile(props.zkeyUrl, zkeyFile)

  let input = {}
  if (props.inputFile) {
    input = JSON.parse(fs.readFileSync(props.inputFile).toString())
  } else if (props.input) {
    input = props.input
  }

  const { proof, publicSignals }
    = await snarkjs.groth16.fullProve(input, wasmFile, zkeyFile)

  fs.unlinkSync(wasmFile)
  fs.unlinkSync(zkeyFile)

  return { proof, publicSignals }
}