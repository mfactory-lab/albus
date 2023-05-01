import { PublicKey } from '@solana/web3.js'
import log from 'loglevel'
import * as snarkjs from 'snarkjs'
import { useContext } from '../../context'

interface Opts {
  // Circuit NFT address
  circuit: string
  // Proof NFT address
  proof: string
}

/**
 * Verify the proof
 */
export async function verifyProof(opts: Opts) {
  const { metaplex } = useContext()

  const circuitNft = await metaplex.nfts().findByMint({
    mintAddress: new PublicKey(opts.circuit),
    loadJsonMetadata: true,
  })

  if (!circuitNft.json?.vk) {
    throw new Error('Invalid circuit! Metadata does not contain verification key.')
  }

  // Find proof NFT
  const proofNft = await metaplex.nfts().findByMint({
    mintAddress: new PublicKey(opts.proof),
    loadJsonMetadata: true,
  })

  if (!proofNft.json?.proof) {
    throw new Error('Invalid proof! Metadata does not contain proof information.')
  }

  // log.debug('Downloading zkey file...')
  // const zkeyFile = `${os.tmpdir()}/circuit.zkey`
  // await downloadFile(String(circuitNft.json.vk), zkeyFile)
  // log.debug('Exporting verification key...')
  // const vk = await snarkjs.zKey.exportVerificationKey(zkeyFile)

  const vk = circuitNft.json?.vk as snarkjs.VK
  const proof = proofNft.json?.proof as snarkjs.SnarkjsProof
  const publicSignals = (proofNft.json?.public_input ?? []) as any

  log.debug('VK:', vk)
  log.debug('Proof:', proof)
  log.debug('PublicSignals:', publicSignals)

  log.debug('Verifying proof...')

  const status = await snarkjs.groth16.verify(vk, publicSignals, proof)

  log.info('Status:', status)

  process.exit(0)
}
