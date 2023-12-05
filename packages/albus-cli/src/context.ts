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

import { readFileSync } from 'node:fs'
import { Buffer } from 'node:buffer'
import { Metaplex, irysStorage, keypairIdentity } from '@metaplex-foundation/js'
import { AnchorProvider, Wallet, web3 } from '@coral-xyz/anchor'
import type { Cluster } from '@solana/web3.js'
import { Keypair } from '@solana/web3.js'
import { AlbusClient } from '@albus-finance/sdk'
import { clusterUrl } from './utils'
import config from './config'

let context: Context

export function useContext() {
  return context
}

export function initContext({ cluster, keypair }: { cluster: Cluster, keypair: string }) {
  const opts = AnchorProvider.defaultOptions()
  const endpoint = cluster.startsWith('http') ? cluster : clusterUrl(cluster)
  const connection = new web3.Connection(endpoint, opts.commitment)

  const wallet = new Wallet(
    Keypair.fromSecretKey(Buffer.from(JSON.parse(
      keypair.startsWith('[') && keypair.endsWith(']') ? keypair : readFileSync(keypair).toString(),
    ))),
  )
  const provider = new AnchorProvider(connection, wallet, opts)
  const client = new AlbusClient(provider)
  const metaplex = Metaplex.make(provider.connection)
    .use(keypairIdentity(wallet.payer))
    .use(irysStorage({
      address: 'https://devnet.irys.xyz',
      providerUrl: connection.rpcEndpoint,
      timeout: 60000,
    }))

  const issuerKeypair = Keypair.fromSecretKey(Uint8Array.from(config.issuerSecretKey))

  return context = { keypair: wallet.payer, issuerKeypair, provider, client, cluster, config, metaplex }
}

export type Context = {
  cluster: Cluster
  provider: AnchorProvider
  keypair: Keypair
  issuerKeypair: Keypair
  metaplex: Metaplex
  client: AlbusClient
  config: typeof config
}
