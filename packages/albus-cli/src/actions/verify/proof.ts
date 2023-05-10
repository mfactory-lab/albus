import log from 'loglevel'
import { useContext } from '../../context'

interface Opts {
  // Proof NFT address
  proof: string
}

/**
 * Verify the proof
 */
export async function verifyProof(opts: Opts) {
  const { client } = useContext()

  const proof = await client.loadProof(opts.proof)
  const circuit = await client.loadCircuit(proof.circuit)

  log.debug('Circuit:', circuit.id)
  log.debug('CircuitAddress:', circuit.address)
  log.debug('VK:', circuit.vk)
  log.debug('Proof:', proof.payload)
  log.debug('PublicSignals:', proof.publicInput)

  log.debug('Verifying proof...')

  const isVerified = await client.verifyProof(proof)

  if (isVerified) {
    log.debug('Verified!')
  } else {
    log.debug('Rejected!')
  }

  process.exit(0)
}
