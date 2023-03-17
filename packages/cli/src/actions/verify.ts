import os from 'os'
import { PublicKey } from '@solana/web3.js'
import log from 'loglevel'
import type { SnarkjsProof } from 'snarkjs'
import * as snarkjs from 'snarkjs'
import { useContext } from '../context'
import { downloadFile } from '../utils'

export async function verifyProof(opts: any) {
  const { metaplex } = useContext()

  const circuitNft = await metaplex.nfts().findByMint({
    mintAddress: new PublicKey(opts.circuit),
    loadJsonMetadata: true,
  })

  if (!circuitNft.json?.zkey_url) {
    throw new Error('Invalid circuit')
  }

  const proofNft = await metaplex.nfts().findByMint({
    mintAddress: new PublicKey(opts.proof),
    loadJsonMetadata: true,
  })

  if (!proofNft.json?.proof) {
    throw new Error('Invalid proof')
  }

  const zkeyFile = `${os.tmpdir()}/circuit.zkey`
  await downloadFile(String(circuitNft.json.zkey_url), zkeyFile)

  log.debug('Exporting verification key...')
  const vk = await snarkjs.zKey.exportVerificationKey(zkeyFile)

  log.debug('Verifying proof...')
  const proof = proofNft.json?.proof as SnarkjsProof
  const publicSignals = (proofNft.json?.public_input ?? []) as any
  const res = await snarkjs.groth16.verify(vk, publicSignals, proof)

  console.log(res)
  process.exit(0)
}
