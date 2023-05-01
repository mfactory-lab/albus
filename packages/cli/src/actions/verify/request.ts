import log from 'loglevel'
import snarkjs from 'snarkjs'
import { useContext } from '../../context'
import { loadCircuit, loadProof } from '../prove/utils'

interface Opts {}

/**
 * Verify ZKP request
 */
export async function verifyRequest(addr: string, opts: Opts) {
  const { client } = useContext()

  const req = await client.loadZKPRequest(addr)

  if (!req.proof) {
    throw new Error('ZKP request is not proved!')
  }

  const circuit = await loadCircuit(req.circuit)
  const proof = await loadProof(req.proof)

  log.debug('VerificationKey:', circuit.vk)
  log.debug('Proof:', proof.proofData)
  log.debug('PublicSignals:', proof.publicInput)

  log.debug('Verifying proof...')

  const status = await snarkjs.groth16.verify(circuit.vk, proof.publicInput, proof.proofData)

  log.info('Status:', status)

  // TODO: update ZKPRequest

  process.exit(0)
}
