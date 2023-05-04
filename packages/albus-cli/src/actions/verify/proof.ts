import log from 'loglevel'
import * as snarkjs from 'snarkjs'
import { loadCircuit, loadProof } from '../prove/utils'

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
  const circuit = await loadCircuit(opts.circuit)
  const proof = await loadProof(opts.proof)

  log.debug('VK:', circuit.vk)
  log.debug('Proof:', proof.payload)
  log.debug('PublicSignals:', proof.publicInput)

  log.debug('Verifying proof...')

  const isVerified = await snarkjs.groth16.verify(circuit.vk, proof.publicInput, proof.payload)

  if (isVerified) {
    log.debug('Verified!')
  } else {
    log.debug('Rejected!')
  }

  process.exit(0)
}
