import { PublicKey } from '@solana/web3.js'
import log from 'loglevel'
import * as snarkjs from 'snarkjs'
import { useContext } from '../../context'
import { loadCircuit, loadProof } from '../prove/utils'

interface Opts {}

/**
 * Verify ZKP request
 */
export async function verifyRequest(addr: string, _opts: Opts) {
  const { client } = useContext()

  const req = await client.loadZKPRequest(addr)

  if (!req.proof) {
    throw new Error('ZKP request is not proved!')
  }

  const circuit = await loadCircuit(req.circuit)
  const proof = await loadProof(req.proof)

  log.debug('VK:', circuit.vk)
  log.debug('Proof:', proof.payload)
  log.debug('PublicSignals:', proof.publicInput)

  log.debug('Verifying proof...')

  const isVerified = await snarkjs.groth16.verify(circuit.vk, proof.publicInput, proof.payload)

  try {
    if (isVerified) {
      await client.verify({ zkpRequest: new PublicKey(addr) })
      log.debug('Verified!')
    } else {
      await client.reject({ zkpRequest: new PublicKey(addr) })
      log.debug('Rejected!')
    }
  } catch (e) {
    log.error(e)
  }

  process.exit(0)
}
