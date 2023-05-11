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

import type { Keypair, PublicKey } from '@solana/web3.js'
import type { SMT } from 'circomlibjs'
import { buildPoseidon, newMemEmptyTrie } from 'circomlibjs'
import { crypto } from '../../../../albus-core'

const { hash, edBabyJubJub } = crypto
const { arrayToBigInt } = crypto.utils

export class Identity {
  did: string | undefined
  accounts: IdentityAccount[] = []

  async hashAccount(pubkey: PublicKey): Promise<Uint8Array> {
    return hash.poseidon([pubkey.toBytes()])
  }

  async getAccountSMT(): Promise<SMT> {
    const tree = await newMemEmptyTrie()
    for (let key = 0; key < this.accounts.length; key++) {
      await tree.insert(key, await this.hashAccount(this.accounts[key].pubkey))
    }
    return tree
  }

  async addAccount(keypair: Keypair, meta?: IdentityAccountMeta) {
    const tree = await this.getAccountSMT()
    const newKey = this.accounts.push({ pubkey: keypair.publicKey, meta }) - 1
    const newValue = await this.hashAccount(keypair.publicKey)
    const res = await tree.insert(newKey, newValue)
    const sig = await signPoseidon(keypair.secretKey, [newValue])

    return {
      oldRoot: tree.F.toString(res.oldRoot),
      newRoot: tree.F.toString(res.newRoot),
      oldKey: tree.F.toString(res.oldKey),
      oldValue: tree.F.toString(res.oldValue),
      newValue: tree.F.toString(newValue),
      newKey,
      siblings: siblingsPad(res.siblings.map(s => tree.F.toString(s))),
      isOld0: res.isOld0 ? 1 : 0,
      // verification
      sig: sig.sig.map(v => arrayToBigInt(v).toString()),
      pubkey: sig.pubkey.map(v => arrayToBigInt(v).toString()),
      msg: arrayToBigInt(sig.hash).toString(),
    }
  }

  async deleteAccount(keypair: Keypair) {
    const tree = await this.getAccountSMT()
    const key = this.accounts.findIndex(p => p.pubkey.toBase58() === keypair.publicKey.toBase58())
    const res = await tree.delete(key)
    const sig = await signPoseidon(keypair.secretKey, [keypair.publicKey.toBytes()])

    return {
      ...res,
      sig,
    }
  }
}

interface IdentityAccountMeta {
  name: string
}

interface IdentityAccount {
  pubkey: PublicKey
  meta?: IdentityAccountMeta
}

const poseidonPromise = buildPoseidon()

export async function signPoseidon(secretKey: Uint8Array, inputs: Uint8Array[]) {
  const poseidon = await poseidonPromise
  const hash = poseidon(inputs)
  const { s, r8 } = await edBabyJubJub.signPoseidon(secretKey, hash)
  const pubkey = await edBabyJubJub.privateKeyToPublicKey(secretKey)
  return {
    sig: [r8[0], r8[1], s],
    pubkey,
    hash,
  }
}

function siblingsPad(siblings: any[], nLevels = 10) {
  while (siblings.length < nLevels) {
    siblings.push(0)
  }
  return siblings
}
