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

  private getBits(key: bigint) {
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

  async update(key: bigint, newValue: bigint) {
    const resFind = await this.get(key)
    const res = {} as UpdateSmtResponse
    res.oldRoot = this.root
    res.oldKey = key
    res.oldValue = resFind.value
    res.newKey = key
    res.newValue = newValue
    res.siblings = resFind.siblings

    const inserts: [bigint, bigint[]][] = []
    const deletes: bigint[] = []

    let rtOld = this.hash1(key, res.oldValue)
    let newRoot = this.hash1(key, newValue)
    inserts.push([newRoot, [this.F.one, key, newValue]])
    deletes.push(rtOld)

    const keyBits = this.getBits(key)
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
      deletes.push(rtOld)
      inserts.push([newRoot, newNode])
    }

    res.newRoot = newRoot

    await this.db.multiDel(deletes)
    await this.db.multiIns(inserts)
    await this.db.setRoot(newRoot)
    this.root = newRoot

    return res
  }

  async delete(key: bigint) {
    const resFind = await this.get(key)
    if (!resFind.found) {
      throw new Error('Key does not exists')
    }

    const res = {
      siblings: [],
      delKey: key,
      delValue: resFind.value,
    } as DeleteFromSmtResponse

    const inserts: [bigint, bigint[]][] = []
    const deletes: bigint[] = []

    let oldRoot = this.hash1(key, resFind.value)
    let newRoot: bigint

    deletes.push(oldRoot)

    let mixed: boolean
    if (resFind.siblings.length > 0) {
      const record = await this.db.get(resFind.siblings[resFind.siblings.length - 1])
      if (record.length === 3 && this.F.eq(record[0], this.F.one)) {
        mixed = false
        res.oldKey = record[1]
        res.oldValue = record[2]
        res.isOld0 = false
        newRoot = resFind.siblings[resFind.siblings.length - 1]
      } else if (record.length === 2) {
        mixed = true
        res.oldKey = key
        res.oldValue = this.F.zero
        res.isOld0 = true
        newRoot = this.F.zero
      } else {
        throw new Error('Invalid node. Database corrupted')
      }
    } else {
      newRoot = this.F.zero
      res.oldKey = key
      res.oldValue = this.F.zero
      res.isOld0 = true
    }

    const keyBits = this.getBits(key)

    for (let level = resFind.siblings.length - 1; level >= 0; level--) {
      let newSibling = resFind.siblings[level]
      if (level === resFind.siblings.length - 1 && !res.isOld0) {
        newSibling = this.F.zero
      }

      const oldSibling = resFind.siblings[level]

      if (keyBits[level]) {
        oldRoot = this.hash0(oldSibling, oldRoot)
      } else {
        oldRoot = this.hash0(oldRoot, oldSibling)
      }

      deletes.push(oldRoot)

      if (!this.F.isZero(newSibling)) {
        mixed = true
      }

      if (mixed) {
        res.siblings.unshift(resFind.siblings[level])
        let newNode: bigint[]
        if (keyBits[level]) {
          newNode = [newSibling, newRoot]
        } else {
          newNode = [newRoot, newSibling]
        }
        newRoot = this.hash0(newNode[0], newNode[1])
        inserts.push([newRoot, newNode])
      }
    }

    await this.db.multiIns(inserts)
    await this.db.setRoot(newRoot)
    await this.db.multiDel(deletes)

    this.root = newRoot

    res.newRoot = newRoot
    res.oldRoot = oldRoot

    return res
  }

  async add(key: bigint, value: bigint) {
    let addedOne = false
    const res = {} as AddIntoSmtResponse
    res.oldRoot = this.root
    const newKeyBits = this.getBits(key)

    let oldRoot: bigint

    const resFind = await this.get(key)

    if (resFind.found === true) {
      throw new Error('Key already exists')
    }

    res.siblings = resFind.siblings
    let mixed: boolean

    if (!resFind.isOld0) {
      const oldKeyBits = this.getBits(resFind.key)
      for (let i = res.siblings.length; oldKeyBits[i] === newKeyBits[i]; i++) {
        res.siblings.push(this.F.zero)
      }
      oldRoot = this.hash1(resFind.key, resFind.value)
      res.siblings.push(oldRoot)
      addedOne = true
      mixed = false
    } else if (res.siblings.length > 0) {
      mixed = true
      oldRoot = this.F.zero
    }

    const inserts = []
    const deletes = []

    let root = this.hash1(key, value)
    inserts.push([root, [this.F.one, key, value]])

    for (let i = res.siblings.length - 1; i >= 0; i--) {
      if (i < res.siblings.length - 1 && !this.F.isZero(res.siblings[i])) {
        mixed = true
      }

      if (mixed) {
        const oldSibling = resFind.siblings[i]
        if (newKeyBits[i]) {
          oldRoot = this.hash0(oldSibling, oldRoot)
        } else {
          oldRoot = this.hash0(oldRoot, oldSibling)
        }
        deletes.push(oldRoot)
      }

      let newRoot: bigint
      if (newKeyBits[i]) {
        newRoot = this.hash0(res.siblings[i], root)
        inserts.push([newRoot, [res.siblings[i], root]])
      } else {
        newRoot = this.hash0(root, res.siblings[i])
        inserts.push([newRoot, [root, res.siblings[i]]])
      }

      root = newRoot
    }

    if (addedOne) {
      res.siblings.pop()
    }

    while (res.siblings.length > 0 && this.F.isZero(res.siblings[res.siblings.length - 1])) {
      res.siblings.pop()
    }

    res.oldKey = resFind.key
    res.oldValue = resFind.value
    res.newRoot = root
    res.isOld0 = resFind.isOld0

    await this.db.multiIns(inserts)
    await this.db.setRoot(root)
    await this.db.multiDel(deletes)

    this.root = root

    return res
  }

  async get(k: string | number | bigint) {
    const key = this.F.e(k)
    return this._find(key, this.getBits(key), this.root, 0)
  }

  async _find(key: bigint, keyBits: number[], root: bigint, level: number): Promise<FindFromSmtResponse> {
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

    if (record.length === 3 && this.F.eq(record[0], this.F.one)) {
      const found = this.F.eq(record[1], key)
      return {
        found,
        key: found ? key : record[1],
        value: record[2],
        siblings: [],
        isOld0: false,
      }
    }

    let res: FindFromSmtResponse

    if (keyBits[level] === 0) {
      res = await this._find(key, keyBits, record[0], level + 1)
      res.siblings.unshift(record[1])
    } else {
      res = await this._find(key, keyBits, record[1], level + 1)
      res.siblings.unshift(record[0])
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

  async multiDel(keys: bigint[]) {
    for (let i = 0; i < keys.length; i++) {
      const keyS = this._key2str(keys[i])
      delete this.nodes[keyS]
    }
  }
}

export type AddIntoSmtResponse = {
  oldRoot: bigint
  oldKey: bigint
  oldValue: bigint
  siblings: bigint[]
  newRoot: bigint
  isOld0: boolean
}

export type UpdateSmtResponse = {
  oldRoot: bigint
  oldKey: bigint
  oldValue: bigint
  newKey: bigint
  newValue: bigint
  siblings: bigint[]
  newRoot: bigint
}

export type DeleteFromSmtResponse = {
  oldRoot: bigint
  oldKey: bigint
  oldValue: bigint
  delKey: bigint
  delValue: bigint
  siblings: bigint[]
  newRoot: bigint
  isOld0: boolean
}

export type FindFromSmtResponse = {
  found: boolean
  key: bigint
  value: bigint
  siblings: bigint[]
  isOld0: boolean
}
