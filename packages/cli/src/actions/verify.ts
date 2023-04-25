import os from 'node:os'
import { PublicKey } from '@solana/web3.js'
import log from 'loglevel'
import type { SnarkjsProof } from 'snarkjs'
import * as snarkjs from 'snarkjs'
import { useContext } from '../context'
import { downloadFile } from '../utils'

interface VerifyProofOpts {
  // Circuit NFT address
  circuit: string
  // Proof NFT address
  proof: string
}

/**
 * Verify the proof
 */
export async function verifyProof(opts: VerifyProofOpts) {
  const { metaplex } = useContext()

  const circuitNft = await metaplex.nfts().findByMint({
    mintAddress: new PublicKey(opts.circuit),
    loadJsonMetadata: true,
  })

  if (!circuitNft.json?.zkey_url) {
    throw new Error('Invalid circuit, `zkey_url` is undefined')
  }

  // Find proof NFT
  const proofNft = await metaplex.nfts().findByMint({
    mintAddress: new PublicKey(opts.proof),
    loadJsonMetadata: true,
  })

  if (!proofNft.json?.proof) {
    throw new Error('Invalid proof, metadata does not contain proof data')
  }

  log.debug('Downloading zkey file...')
  const zkeyFile = `${os.tmpdir()}/circuit.zkey`
  await downloadFile(String(circuitNft.json.zkey_url), zkeyFile)

  log.debug('Exporting verification key...')
  const vk = await snarkjs.zKey.exportVerificationKey(zkeyFile)

  log.debug('Verifying proof...')

  const proof = proofNft.json?.proof as SnarkjsProof
  log.debug('Proof:', proof)

  const publicSignals = (proofNft.json?.public_input ?? []) as any
  log.debug('PublicSignals:', publicSignals)

  const res = await snarkjs.groth16.verify(vk, publicSignals, proof)
  console.log(res)

  process.exit(0)
}
