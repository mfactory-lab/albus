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

import { LAMPORTS_PER_SOL, PublicKey, clusterApiUrl } from '@solana/web3.js'
import type { Cluster, PublicKeyInitData, Transaction } from '@solana/web3.js'
import * as anchor from '@coral-xyz/anchor'
import { useContext } from '../context'

export function clusterUrl(c: Cluster) {
  switch (c) {
    case 'mainnet-beta':
      return 'https://solana-api.projectserum.com/'
    case 'testnet':
      return 'https://testnet.rpcpool.com'
  }
  return clusterApiUrl(c as any)
}

function exploreLink(id: string, opts: { type: 'tx' | 'address', cluster?: Cluster }) {
  let cluster: Cluster = opts.cluster ?? 'mainnet-beta'
  if (cluster.startsWith('http')) {
    if (cluster.includes('devnet')) {
      cluster = 'devnet'
    } else if (cluster.includes('testnet')) {
      cluster = 'testnet'
    }
  }
  return `https://explorer.solana.com/${opts.type}/${id}?cluster=${cluster}`
}

export function exploreAddress(addr: PublicKeyInitData) {
  const { cluster } = useContext()
  return exploreLink(new PublicKey(addr).toString(), { type: 'address', cluster })
}

export function exploreTransaction(signature: string) {
  const { cluster } = useContext()
  return exploreLink(signature, { type: 'tx', cluster })
}

/**
 * Generates a link for inspecting the contents
 */
export function inspectTransaction(tx: Transaction, cluster: Cluster = 'mainnet-beta') {
  tx.recentBlockhash = PublicKey.default.toString()
  const base64 = tx.serializeMessage().toString('base64')
  return {
    base64,
    url: `https://explorer.solana.com/tx/inspector?cluster=${cluster}&message=${encodeURIComponent(
      base64,
    )}`,
  }
}

export function lamportsToSol(lamports: number | anchor.BN): number {
  if (typeof lamports === 'number') {
    return Math.abs(lamports) / LAMPORTS_PER_SOL
  }
  let signMultiplier = 1
  if (lamports.isNeg()) {
    signMultiplier = -1
  }
  const absLamports = lamports.abs()
  const lamportsString = absLamports.toString(10).padStart(10, '0')
  const splitIndex = lamportsString.length - 9
  const solString = `${lamportsString.slice(0, splitIndex)}.${lamportsString.slice(splitIndex)}`
  return signMultiplier * Number.parseFloat(solString)
}

export function solToLamports(amount: number): number {
  if (Number.isNaN(amount)) {
    return Number(0)
  }
  return new anchor.BN(amount.toFixed(9).replace('.', '')).toNumber()
}
