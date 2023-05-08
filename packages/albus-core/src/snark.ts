import log from 'loglevel'
import fetch from 'node-fetch'
import * as snarkjs from 'snarkjs'

interface GenerateProofProps {
  wasmUrl: string
  zkeyUrl: string
  input?: { [key: string]: number }
}

/**
 * Generates a proof using the `groth16` proof system.
 * @returns {Promise<SNARK>}
 */
export async function generateProof(props: GenerateProofProps) {
  return snarkjs.groth16.fullProve(props.input ?? {}, {
    type: 'mem',
    data: await fetchBytes(props.wasmUrl),
  }, {
    type: 'mem',
    data: await fetchBytes(props.zkeyUrl),
  })
}

/**
 * Fetches bytes from the specified URL using the fetch API.
 */
async function fetchBytes(url: string) {
  log.debug(`Loading file ${url}...`)
  const resp = await fetch(url)
  return new Uint8Array(await resp.arrayBuffer())
}
