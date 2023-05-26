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

import { clusterApiUrl } from '@solana/web3.js'
import type { Cluster } from '@solana/web3.js'
import { useContext } from './context'

export function clusterUrl(c: Cluster) {
  switch (c) {
    case 'mainnet-beta':
      // return 'https://rpc.theindex.io'
      // return 'https://ssc-dao.genesysgo.net'
      // return 'https://jpoolone.genesysgo.net'
      return 'https://solana-api.projectserum.com/'
    case 'testnet':
      return 'https://testnet.rpcpool.com'
  }
  return clusterApiUrl(c as any)
}

export function exploreTransaction(signature: string) {
  const { cluster } = useContext()
  return exploreLink(signature, { type: 'tx', cluster })
}

function exploreLink(id: string, opts: { type: 'tx' | 'address'; cluster?: Cluster }) {
  return `https://explorer.solana.com/${opts.type}/${id}?cluster=${opts.cluster ?? 'mainnet-beta'}`
}
