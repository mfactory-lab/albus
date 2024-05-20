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
import { w3cDateToUnixTs } from '../utils'
import { DEFAULT_VC_TYPE } from './constants'
import type { W3CCredential } from './types'
import { CredentialType } from './types'

type Claim = string | number | bigint
export type Claims = Record<string, Claim>

export type CredentialTreeOpts = { depth?: number }

export const DEFAULT_TREE_DEPTH = 5 // 2^5-1 = 16 elements

/**
 * Creates a credential tree based on the given W3C credential and optional depth.
 */
export async function createCredentialTree(credential: W3CCredential, opts?: CredentialTreeOpts) {
  const meta: Record<string, any> = {}

  const issuer = typeof credential.issuer === 'string'
    ? credential.issuer
    : credential.issuer?.id ?? ''

  if (issuer) {
    meta.issuer = new ClaimValue(issuer, { hash: true })
  }

  meta.validUntil = credential.validUntil ? w3cDateToUnixTs(credential.validUntil) : 0
  meta.validFrom = credential.validFrom
    ? w3cDateToUnixTs(credential.validFrom)
    : credential.issuanceDate
      ? w3cDateToUnixTs(credential.issuanceDate)
      : 0

  const type = credential.type.slice(-1)[0]
  if (![DEFAULT_VC_TYPE, CredentialType.AlbusCredential].includes(type)) {
    meta.type = new ClaimValue(type, { hash: true })
  }

  return ClaimsTree.from({ ...credential.credentialSubject, meta }, opts)
}

/**
 * Represents a claim value.
 */
export class ClaimValue {
  constructor(readonly value: Claim | ClaimValue, readonly opts?: { hash?: boolean }) {
  }

  encode(): bigint {
    if (this.value instanceof ClaimValue) {
      return this.value.encode()
    }

    const bytes = new TextEncoder().encode(String(this.value))

    if (this.opts?.hash) {
      return poseidon.hashBytes(bytes)
    }

    if (bytes.length > 32) {
      // throw new Error('The maximum size for a claim is limited to 32 bytes.')
      return bytesToBigInt(bytes.slice(0, 32))
      // return poseidon.hashBytes(bytes)
    }

    return bytesToBigInt(bytes)
  }
}

/**
 * Represents a merkle claims tree.
 */
export class ClaimsTree {
  private readonly smt: SMT = new SMT()
  private keys: string[] = []

  private constructor(readonly opts?: CredentialTreeOpts) {
  }

  static async from(claims: Record<string, any>, opts?: CredentialTreeOpts) {
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
  static encodeValue(value: Claim | ClaimValue, opts?: { hash?: boolean }): bigint {
    return new ClaimValue(value, opts).encode()
  }

  /**
   * Decodes a claim value from a BigInt.
   */
  static decodeValue(value: bigint): string {
    return bytesToString(bigintToBytes(value))
  }

  get treeDepth() {
    return this.opts?.depth ?? DEFAULT_TREE_DEPTH
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

  // /**
  //  * Retrieve proof from the given keys.
  //  */
  // async proof(keys?: string[]) {
  //   const proofKey: number[] = []
  //   const proof: bigint[][] = []
  //   for (const k of keys ?? this.keys) {
  //     const { key, siblings } = await this.get(k)
  //     proofKey.push(Number(key))
  //     proof.push(siblings)
  //   }
  //   return {
  //     key: bytesToBigInt(proofKey.reverse()),
  //     proof,
  //   }
  // }
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
