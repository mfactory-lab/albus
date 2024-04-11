/*
 * This file is part of Albus code.
 *
 * Copyright (c) 2023, mFactory GmbH
 *
 * Albus is free software: you can redistribute it
 * and/or modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * Albus is distributed in the hope that it
 * will be useful, but WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.
 * If not, see <https://www.gnu.org/licenses/agpl-3.0.html>.
 *
 * You can be released from the requirements of the Affero GNU General Public License
 * by purchasing a commercial license. The purchase of such a license is
 * mandatory as soon as you develop commercial activities using the
 * Albus code without disclosing the source code of
 * your own applications.
 *
 * The developer of this program can be contacted at <info@albus.finance>.
 */

import { SMT, poseidon } from '../crypto'
import { bigintToBytes, bytesToBigInt, bytesToString } from '../crypto/utils'
import { DEFAULT_CLAIM_TREE_DEPTH } from './constants'

/**
 * Creates a claims tree based on the provided claims object and optional depth.
 *
 * @param {Record<string, any>} claims - The claims object to create the tree from.
 * @param {number} [depth] - The optional depth of the tree. If not provided, the default depth will be used.
 * @return An object representing the claims tree with various methods for interacting with it.
 */
export async function createClaimsTree(claims: Record<string, any>, depth?: number) {
  const tree = new SMT()
  const flattenClaims = flattenObject(claims)
  const flattenClaimKeys = Object.keys(flattenClaims)
  const encodeKey = (k: string) => BigInt(flattenClaimKeys.indexOf(k))
  const treeDepth = depth ?? DEFAULT_CLAIM_TREE_DEPTH

  const res = {
    root: () => tree.root,
    /**
     * Retrieves a value from the tree based on the provided key.
     */
    get: async (key: string) => {
      const proof = await tree.get(encodeKey(key))
      const siblings = proof.siblings
      while (siblings.length < treeDepth) {
        siblings.push(tree.F.zero)
      }
      return {
        found: proof.found,
        key: proof.key,
        value: proof.value,
        siblings,
      }
    },
    /**
     * Deletes a key from the tree.
     */
    delete: (key: string) => tree.delete(encodeKey(key)),
    /**
     * Adds a key-value pair to the tree.
     */
    add: (key: string, val: any) => tree.add(encodeKey(key), encodeClaimValue(val)),
    /**
     * Updates the value associated with the given key in the tree.
     */
    update: (key: string, val: any) => tree.update(encodeKey(key), encodeClaimValue(val)),
    /**
     * Retrieve ZK information from the given keys.
     */
    zkInfo: async (keys: string[]) => {
      const claimsKey: number[] = []
      const claimsProof: bigint[][] = []
      for (const key of keys) {
        const proof = await res.get(key)
        claimsKey.push(Number(proof.key))
        claimsProof.push(proof.siblings)
      }
      return {
        key: bytesToBigInt(claimsKey.reverse()),
        proof: claimsProof,
      }
    },
  }

  for (const key of flattenClaimKeys) {
    await res.add(key, flattenClaims[key])
  }

  return res
}

/**
 * Encodes a claim value to a BigInt.
 *
 * @param {string | number | bigint} s - The value to encode.
 * @param hash
 * @return {bigint} - The encoded BigInt value.
 */
export function encodeClaimValue(s: string | number | bigint, hash = false): bigint {
  const bytes = new TextEncoder().encode(String(s))
  if (hash) {
    return poseidon.hashBytes(bytes)
  }
  if (bytes.length > 32) {
    // TODO: fixme
    return bytesToBigInt(bytes.slice(0, 32))
    // throw new Error('The maximum size for a claim is limited to 32 bytes.')
  }
  return bytesToBigInt(bytes)
}

/**
 * Decodes a claim value from a BigInt.
 *
 * @param {bigint} s - The bigint to decode.
 * @return {string} The decoded claim value.
 */
export function decodeClaimValue(s: bigint): string {
  return bytesToString(bigintToBytes(s))
}

/**
 * Recursively flattens an object by converting nested properties into a flat structure.
 *
 * @param {Record<string, any>} obj - The object to flatten.
 * @param {string} [parentKey] - The parent key for the nested properties.
 * @return {Record<string, any>} The flattened object.
 */
function flattenObject(obj: Record<string, any>, parentKey?: string): Record<string, any> {
  let res: Record<string, any> = {}
  Object.entries(obj).forEach(([key, value]) => {
    const k = parentKey ? `${parentKey}.${key}` : key
    if (typeof value === 'object') {
      res = { ...res, ...flattenObject(value, k) }
    } else {
      res[k] = value
    }
  })
  return res
}

// function unflattenObject(obj: Record<string, any>): Record<string, any> {
//   return Object.keys(obj).reduce((res, k) => {
//     k.split('.').reduce(
//       (acc, e, i, keys) => acc[e] || (acc[e] = Number.isNaN(Number(keys[i + 1]))
//         ? keys.length - 1 === i
//           ? obj[k]
//           : {}
//         : []),
//       res,
//     )
//     return res
//   }, {} as any)
// }
