import { Circomkit } from 'circomkit'
import type { Keypair } from '@solana/web3.js'
import { credential, crypto } from '../../../albus-core'

export const circomkit = new Circomkit({
  verbose: false,
})

export async function prepareInput(issuerKeypair: Keypair, claims: Record<string, any>, usedClaims: string[] = [], depth?: number) {
  const issuerPk = crypto.eddsa.prv2pub(issuerKeypair.secretKey)
  const tree = await credential.ClaimsTree.from(claims, { depth })
  const signature = crypto.eddsa.signPoseidon(issuerKeypair.secretKey, tree.root)

  // const credentialProof: bigint[][] = []
  // const keys: number[] = []
  const values: Record<string, bigint | bigint[]> = {}

  for (const key of usedClaims) {
    const claim = await tree.get(key)
    if (!claim.found) {
      throw new Error(`invalid claim ${key}`)
    }
    // keys.push(Number(treeClaim.key))
    // credentialProof.push(treeClaim.siblings)
    const k = key.replace('.', '_')
    values[k] = claim.value
    values[`${k}Key`] = claim.key
    values[`${k}Proof`] = claim.siblings
  }

  return {
    credentialRoot: tree.root,
    // credentialProof,
    // credentialProofKey: crypto.utils.bytesToBigInt(keys.reverse()),
    issuerPk,
    issuerSignature: [...signature.R8, signature.S],
    ...values,
  }
}
