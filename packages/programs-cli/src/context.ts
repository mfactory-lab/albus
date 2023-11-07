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

import fs from 'node:fs'
import { Buffer } from 'node:buffer'
import { VerifiedStakeClient } from '@albus/verified-stake-sdk'
import { VerifiedStakePoolClient } from '@albus/verified-stake-pool-sdk'
import { AnchorProvider, Wallet, web3 } from '@coral-xyz/anchor'
import type { Cluster } from '@solana/web3.js'
import { Keypair } from '@solana/web3.js'
import { AlbusTransferClient } from '../../albus-transfer-sdk'
import { AlbusSwapClient } from '../../albus-swap-sdk'
import { clusterUrl } from './utils'

export type Context = {
  cluster: Cluster
  provider: AnchorProvider
  stakeClient: VerifiedStakeClient
  stakePoolClient: VerifiedStakePoolClient
  swapClient: AlbusSwapClient
  transferClient: AlbusTransferClient
  keypair: Keypair
}

const context: Context = {
  cluster: 'devnet',
  // @ts-expect-error ...
  provider: undefined,
  // @ts-expect-error ...
  stakeClient: undefined,
  // @ts-expect-error ...
  stakePoolClient: undefined,
  // @ts-expect-error ...
  swapClient: undefined,
  // @ts-expect-error ...
  transferClient: undefined,
}

export function initContext({ cluster, keypair }: { cluster: Cluster; keypair: string }) {
  const opts = AnchorProvider.defaultOptions()
  const endpoint = cluster.startsWith('http') ? cluster : clusterUrl(cluster)
  const connection = new web3.Connection(endpoint, opts.commitment)
  const walletKeypair = Keypair.fromSecretKey(Buffer.from(JSON.parse(fs.readFileSync(keypair).toString())))
  const wallet = new Wallet(walletKeypair)

  context.cluster = cluster
  context.provider = new AnchorProvider(connection, wallet, opts)
  context.stakeClient = new VerifiedStakeClient(context.provider)
  context.stakePoolClient = new VerifiedStakePoolClient(context.provider)
  context.swapClient = new AlbusSwapClient(context.provider)
  context.transferClient = new AlbusTransferClient(context.provider)
  context.keypair = walletKeypair

  return context
}

export function useContext() {
  return context
}
