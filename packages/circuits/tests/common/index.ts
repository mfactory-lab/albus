import { Circomkit } from 'circomkit'
import { credential, crypto } from '@albus-finance/core'
import type { Keypair } from '@solana/web3.js'

export const circomkit = new Circomkit({
  verbose: false,
})

export async function prepareInput(issuerKeypair: Keypair, claims: Record<string, any>, usedClaims: string[] = []) {
  const issuerPk = crypto.eddsa.prv2pub(issuerKeypair.secretKey)
  const tree = await credential.ClaimsTree.from(claims)
  const signature = crypto.eddsa.signPoseidon(issuerKeypair.secretKey, tree.root)

  const claimsProof: bigint[][] = []
  const keys: number[] = []
  const values: Record<string, bigint> = {}

  for (const key of usedClaims) {
    const treeClaim = await tree.get(key)
    if (!treeClaim.found) {
      throw new Error(`invalid claim ${key}`)
    }
    keys.push(Number(treeClaim.key))
    claimsProof.push(treeClaim.siblings)
    values[key.replace('.', '_')] = treeClaim.value
  }

  return {
    credentialRoot: tree.root,
    claimsProof,
    claimsKey: crypto.utils.bytesToBigInt(keys.reverse()),
    issuerPk,
    issuerSignature: [...signature.R8, signature.S],
    ...values,
  }
}
