import * as snarkjs from 'snarkjs'

interface GenerateProofProps {
  wasmUrl: string
  zkeyUrl: string
  input?: { [key: string]: number }
}

/**
 * Create new Proof
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

async function fetchBytes(url: string) {
  const resp = await fetch(url)
  return new Uint8Array(await resp.arrayBuffer())
}
