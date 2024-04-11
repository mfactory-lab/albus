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

export type Claims = Record<string, any>

export type ClaimsTreeOptions = { depth?: number }

export class ClaimsTree {
  private readonly smt: SMT = new SMT()
  private keys: string[] = []

  private constructor(readonly opts?: ClaimsTreeOptions) {
  }

  static async from(claims: Claims, opts?: ClaimsTreeOptions) {
    const tree = new ClaimsTree(opts)
    const flattenClaims = flattenObject(claims)
    for (const key in flattenClaims) {
      await tree.add(key, flattenClaims[key])
    }
    return tree
  }

  /**
   * Encodes a claim value to a BigInt.
   */
  static encodeValue(s: string | number | bigint, hash = false): bigint {
    const bytes = new TextEncoder().encode(String(s))
    if (hash) {
      return poseidon.hashBytes(bytes)
    }
    if (bytes.length > 32) {
      // TODO: refactory
      return bytesToBigInt(bytes.slice(0, 32))
      // throw new Error('The maximum size for a claim is limited to 32 bytes.')
    }
    return bytesToBigInt(bytes)
  }

  /**
   * Decodes a claim value from a BigInt.
   */
  static decodeValue(s: bigint): string {
    return bytesToString(bigintToBytes(s))
  }

  get treeDepth() {
    return this.opts?.depth ?? DEFAULT_CLAIM_TREE_DEPTH
  }

  get root() {
    return this.smt.root
  }

  encodeKey(k: string) {
    return BigInt(this.keys.indexOf(k))
  }

  /**
   * Retrieves a value from the tree based on the provided key.
   */
  async get(key: string) {
    const proof = await this.smt.get(this.encodeKey(key))
    const siblings = proof.siblings
    while (siblings.length < this.treeDepth) {
      siblings.push(this.smt.F.zero)
    }
    return {
      found: proof.found,
      key: proof.key,
      value: proof.value,
      siblings,
    }
  }

  /**
   * Deletes a key from the tree.
   */
  delete(key: string) {
    return this.smt.delete(this.encodeKey(key))
  }

  /**
   * Adds a key-value pair to the tree.
   */
  add(key: string, val: any) {
    this.keys.push(key)
    return this.smt.add(this.encodeKey(key), ClaimsTree.encodeValue(val))
  }

  /**
   * Updates the value associated with the given key in the tree.
   */
  update(key: string, val: any) {
    return this.smt.update(this.encodeKey(key), ClaimsTree.encodeValue(val))
  }

  /**
   * Retrieve ZK information from the given keys.
   */
  async zkInfo(keys: string[]) {
    const claimsKey: number[] = []
    const proof: bigint[][] = []
    for (const k of keys) {
      const { key, siblings } = await this.get(k)
      claimsKey.push(Number(key))
      proof.push(siblings)
    }
    return {
      key: bytesToBigInt(claimsKey.reverse()),
      proof,
    }
  }
}

/**
 * Encodes a claim value to a BigInt.
 * @deprecated - Please use ClaimsTree.encodeValue
 */
export function encodeClaimValue(s: string | number | bigint, hash = false): bigint {
  return ClaimsTree.encodeValue(s, hash)
}

/**
 * Decodes a claim value from a BigInt.
 * @deprecated - Please use ClaimsTree.decodeClaimValue
 */
export function decodeClaimValue(s: bigint): string {
  return ClaimsTree.decodeValue(s)
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
