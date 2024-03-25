import { Circomkit } from 'circomkit'
import type { Claims } from '@albus-finance/core'
import { credential, crypto } from '@albus-finance/core'
import type { Keypair } from '@solana/web3.js'

const encoder = new TextEncoder()

export const circomkit = new Circomkit({
  verbose: false,
})

export function countryLookup(iso2Codes: string[]) {
  if (iso2Codes.length > 16) {
    throw new Error('countryLookup cannot have more than 16 codes')
  }
  return iso2Codes.reduce((acc, code) => {
    acc.push(...encoder.encode(code))
    return acc
  }, [] as number[])
}

export async function prepareInput(issuerKeypair: Keypair, claims: Claims, usedClaims: string[] = []) {
  const issuerPk = crypto.eddsa.prv2pub(issuerKeypair.secretKey)

  const tree = await credential.createClaimsTree(claims)

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
