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

import type { F1Field } from './ff'
import { Scalar } from './ff'
import { Poseidon, poseidon } from './poseidon'

export class SMT {
  F: F1Field
  db: SMTMemDb
  root: bigint

  constructor(db?: any) {
    this.F = Poseidon.F
    this.db = db ?? new SMTMemDb(this.F)
    this.root = this.db.root
  }

  private _splitBits(key: bigint) {
    const res = Scalar.bits(this.F.toObject(key))
    while (res.length < 256) {
      res.push(0)
    }
    return res
  }

  private hash0(left: bigint, right: bigint) {
    return poseidon.hash([left, right])
  }

  private hash1(key: bigint, value: bigint) {
    return poseidon.hash([key, value, this.F.one])
  }

  async update(k: bigint, v: bigint) {
    const key = this.F.e(k)
    const newValue = this.F.e(v)

    const resFind = await this.get(key)
    const res = {} as UpdateSmtResponse
    res.oldRoot = this.root
    res.oldKey = key
    res.oldValue = resFind.value
    res.newKey = key
    res.newValue = newValue
    res.siblings = resFind.siblings

    const ins: [bigint, bigint[]][] = []
    const dels = []

    let rtOld = this.hash1(key, res.oldValue)
    let newRoot = this.hash1(key, newValue)
    ins.push([newRoot, [1n, key, newValue]])
    dels.push(rtOld)

    const keyBits = this._splitBits(key)
    for (let level = resFind.siblings.length - 1; level >= 0; level--) {
      let oldNode: bigint[], newNode: bigint[]
      const sibling = resFind.siblings[level]
      if (keyBits[level]) {
        oldNode = [sibling, rtOld]
        newNode = [sibling, newRoot]
      } else {
        oldNode = [rtOld, sibling]
        newNode = [newRoot, sibling]
      }
      rtOld = this.hash0(oldNode[0], oldNode[1])
      newRoot = this.hash0(newNode[0], newNode[1])
      dels.push(rtOld)
      ins.push([newRoot, newNode])
    }

    res.newRoot = newRoot

    await this.db.multiDel(dels)
    await this.db.multiIns(ins)
    await this.db.setRoot(newRoot)
    this.root = newRoot

    return res
  }

  async delete(k: bigint) {
    const key = this.F.e(k)

    const resFind = await this.get(key)
    if (!resFind.found) {
      throw new Error('Key does not exists')
    }

    const res = {
      siblings: [],
      delKey: key,
      delValue: resFind.value,
    } as DeleteFromSmtResponse

    const dels = []
    const ins = []
    let rtOld = this.hash1(key, resFind.value)
    let rtNew: bigint
    dels.push(rtOld)

    let mixed: boolean
    if (resFind.siblings.length > 0) {
      const record = await this.db.get(resFind.siblings[resFind.siblings.length - 1])
      if ((record.length === 3) && (this.F.eq(record[0], this.F.one))) {
        mixed = false
        res.oldKey = record[1]
        res.oldValue = record[2]
        res.isOld0 = false
        rtNew = resFind.siblings[resFind.siblings.length - 1]
      } else if (record.length === 2) {
        mixed = true
        res.oldKey = key
        res.oldValue = this.F.zero
        res.isOld0 = true
        rtNew = this.F.zero
      } else {
        throw new Error('Invalid node. Database corrupted')
      }
    } else {
      rtNew = this.F.zero
      res.oldKey = key
      res.oldValue = this.F.zero
      res.isOld0 = true
    }

    const keyBits = this._splitBits(key)

    for (let level = resFind.siblings.length - 1; level >= 0; level--) {
      let newSibling = resFind.siblings[level]
      if ((level === resFind.siblings.length - 1) && (!res.isOld0)) {
        newSibling = this.F.zero
      }
      const oldSibling = resFind.siblings[level]
      if (keyBits[level]) {
        rtOld = this.hash0(oldSibling, rtOld)
      } else {
        rtOld = this.hash0(rtOld, oldSibling)
      }
      dels.push(rtOld)
      if (!this.F.isZero(newSibling)) {
        mixed = true
      }

      if (mixed) {
        res.siblings.unshift(resFind.siblings[level])
        let newNode: bigint[]
        if (keyBits[level]) {
          newNode = [newSibling, rtNew]
        } else {
          newNode = [rtNew, newSibling]
        }
        rtNew = this.hash0(newNode[0], newNode[1])
        ins.push([rtNew, newNode])
      }
    }

    await this.db.multiIns(ins)
    await this.db.setRoot(rtNew)
    this.root = rtNew
    await this.db.multiDel(dels)

    res.newRoot = rtNew
    res.oldRoot = rtOld

    return res
  }

  async add(k: bigint, v: bigint) {
    const key = this.F.e(k)
    const value = this.F.e(v)

    let addedOne = false
    const res = {} as AddIntoSmtResponse
    res.oldRoot = this.root
    const newKeyBits = this._splitBits(key)

    let rtOld: bigint

    const resFind = await this.get(key)

    if (resFind.found === true) {
      throw new Error('Key already exists')
    }

    res.siblings = resFind.siblings
    let mixed: boolean

    if (!resFind.isOld0) {
      const oldKeyBits = this._splitBits(resFind.key)
      for (let i = res.siblings.length; oldKeyBits[i] === newKeyBits[i]; i++) {
        res.siblings.push(this.F.zero)
      }
      rtOld = this.hash1(resFind.key, resFind.value)
      res.siblings.push(rtOld)
      addedOne = true
      mixed = false
    } else if (res.siblings.length > 0) {
      mixed = true
      rtOld = this.F.zero
    }

    const inserts = []
    const dels = []

    let rt = this.hash1(key, value)
    inserts.push([rt, [1, key, value]])

    for (let i = res.siblings.length - 1; i >= 0; i--) {
      if ((i < res.siblings.length - 1) && (!this.F.isZero(res.siblings[i]))) {
        mixed = true
      }
      if (mixed) {
        const oldSibling = resFind.siblings[i]
        if (newKeyBits[i]) {
          rtOld = this.hash0(oldSibling, rtOld)
        } else {
          rtOld = this.hash0(rtOld, oldSibling)
        }
        dels.push(rtOld)
      }

      let newRoot: bigint
      if (newKeyBits[i]) {
        newRoot = this.hash0(res.siblings[i], rt)
        inserts.push([newRoot, [res.siblings[i], rt]])
      } else {
        newRoot = this.hash0(rt, res.siblings[i])
        inserts.push([newRoot, [rt, res.siblings[i]]])
      }
      rt = newRoot
    }

    if (addedOne) {
      res.siblings.pop()
    }
    while ((res.siblings.length > 0) && (this.F.isZero(res.siblings[res.siblings.length - 1]))) {
      res.siblings.pop()
    }
    res.oldKey = resFind.key
    res.oldValue = resFind.value
    res.newRoot = rt
    res.isOld0 = resFind.isOld0

    await this.db.multiIns(inserts)
    await this.db.setRoot(rt)
    this.root = rt
    await this.db.multiDel(dels)

    return res
  }

  async get(k: string | number | bigint) {
    const key = this.F.e(k)
    return this._find(key, this._splitBits(key), this.root, 0)
  }

  async _find(key: bigint, keyBits: number[], root: bigint, level: number): Promise<FindFromSmtResponse> {
    if (typeof root === 'undefined') {
      root = this.root
    }

    if (this.F.isZero(root)) {
      return {
        found: false,
        key,
        value: this.F.zero,
        siblings: [],
        isOld0: true,
      }
    }

    const record = await this.db.get(root)

    let res: FindFromSmtResponse

    if ((record.length === 3) && (this.F.eq(record[0], this.F.one))) {
      if (this.F.eq(record[1], key)) {
        res = {
          found: true,
          key,
          value: record[2],
          siblings: [],
          isOld0: false,
        }
      } else {
        res = {
          found: false,
          key: record[1],
          value: record[2],
          siblings: [],
          isOld0: false,
        }
      }
    } else {
      if (keyBits[level] === 0) {
        res = await this._find(key, keyBits, record[0], level + 1)
        res.siblings.unshift(record[1])
      } else {
        res = await this._find(key, keyBits, record[1], level + 1)
        res.siblings.unshift(record[0])
      }
    }
    return res
  }
}

export class SMTMemDb {
  root: bigint
  nodes: { [key: string]: bigint[] } = {}

  constructor(private readonly F = Poseidon.F) {
    this.root = F.zero
    this.F = F
  }

  async getRoot() {
    return this.root
  }

  private _key2str(k: bigint): string {
    return this.F.toString(k)
  }

  private _normalize(n: Array<string | number | bigint>) {
    for (let i = 0; i < n.length; i++) {
      n[i] = this.F.e(n[i])
    }
  }

  async get(key: bigint) {
    const keyS = this._key2str(key)
    return this.nodes[keyS]
  }

  async multiGet(keys: bigint[]) {
    const res = []
    for (let i = 0; i < keys.length; i++) {
      res.push(this.get(keys[i]))
    }
    return res
  }

  async setRoot(newRoot: bigint) {
    this.root = newRoot
  }

  async multiIns(inserts: Array<[bigint, bigint[]]>) {
    for (let i = 0; i < inserts.length; i++) {
      const keyS = this._key2str(inserts[i][0])
      this._normalize(inserts[i][1])
      this.nodes[keyS] = inserts[i][1]
    }
  }

  async multiDel(dels: bigint[]) {
    for (let i = 0; i < dels.length; i++) {
      const keyS = this._key2str(dels[i])
      delete this.nodes[keyS]
    }
  }
}

export interface AddIntoSmtResponse {
  oldRoot: bigint
  oldKey: bigint
  oldValue: bigint
  siblings: bigint[]
  newRoot: bigint
  isOld0: boolean
}

export interface UpdateSmtResponse {
  oldRoot: bigint
  oldKey: bigint
  oldValue: bigint
  newKey: bigint
  newValue: bigint
  siblings: bigint[]
  newRoot: bigint
}

export interface DeleteFromSmtResponse {
  oldRoot: bigint
  oldKey: bigint
  oldValue: bigint
  delKey: bigint
  delValue: bigint
  siblings: bigint[]
  newRoot: bigint
  isOld0: boolean
}

export interface FindFromSmtResponse {
  found: boolean
  key: bigint
  value: bigint
  siblings: bigint[]
  isOld0: boolean
}
