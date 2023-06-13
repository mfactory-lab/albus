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

import { Buffer } from 'node:buffer'
import fs from 'node:fs'
import { Metaplex, bundlrStorage, keypairIdentity } from '@metaplex-foundation/js'
import { AnchorProvider, Wallet, web3 } from '@coral-xyz/anchor'
import type { Cluster } from '@solana/web3.js'
import { Keypair } from '@solana/web3.js'
import { AlbusClient } from '@albus/sdk'
import { clusterUrl } from './utils'
import config from './config'

export interface Context {
  cluster: Cluster
  provider: AnchorProvider
  keypair: Keypair
  metaplex: Metaplex
  client: AlbusClient
  config: typeof config
}

const context: Context = {
  cluster: 'devnet',
  // @ts-expect-error ...
  provider: undefined,
  // @ts-expect-error ...
  metaplex: undefined,
}

export function initContext({ cluster, keypair }: { cluster: Cluster; keypair: string }) {
  const opts = AnchorProvider.defaultOptions()
  const endpoint = cluster.startsWith('http') ? cluster : clusterUrl(cluster)
  const connection = new web3.Connection(endpoint, opts.commitment)
  const walletKeypair = Keypair.fromSecretKey(Buffer.from(JSON.parse(fs.readFileSync(keypair).toString())))
  const wallet = new Wallet(walletKeypair)

  context.config = config
  context.cluster = cluster
  context.provider = new AnchorProvider(connection, wallet, opts)
  context.keypair = walletKeypair

  context.metaplex = Metaplex.make(context.provider.connection)
    .use(keypairIdentity(context.keypair))
    .use(bundlrStorage({
      address: 'https://devnet.bundlr.network',
      providerUrl: context.provider.connection.rpcEndpoint,
      timeout: 60000,
    }))

  context.client = new AlbusClient(context.provider)

  return context
}

export function useContext() {
  return context
}
