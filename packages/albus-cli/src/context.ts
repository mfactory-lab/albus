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

import { existsSync, readFileSync } from 'node:fs'
import { Buffer } from 'node:buffer'
import { Metaplex, irysStorage, keypairIdentity } from '@metaplex-foundation/js'
import { AnchorProvider, Wallet, web3 } from '@coral-xyz/anchor'
import type { Cluster } from '@solana/web3.js'
import { Keypair } from '@solana/web3.js'
import type { AlbusClientEnv } from '@albus-finance/sdk'
import { AlbusClient } from '@albus-finance/sdk'
import config from './config'

let context: Context

export function useContext() {
  return context
}

export function initContext({ cluster, env, keypair }: { cluster: Cluster, env: AlbusClientEnv, keypair: string }) {
  const opts = AnchorProvider.defaultOptions()
  // opts.commitment = 'confirmed'

  const connection = new web3.Connection(cluster, opts.commitment)

  let keypairBuffer: Buffer
  if (keypair) {
    keypairBuffer = readFileSync(keypair)
  } else if (existsSync('keypair.json')) {
    keypairBuffer = readFileSync('keypair.json')
  } else if (process.env.CLI_SOLANA_KEYPAIR) {
    keypairBuffer = readFileSync(process.env.CLI_SOLANA_KEYPAIR)
  } else {
    throw new Error('Please specify a keypair argument or create a `keypair.json` file')
  }

  const wallet = new Wallet(Keypair.fromSecretKey(Buffer.from(JSON.parse(keypairBuffer.toString()))))
  const provider = new AnchorProvider(connection, wallet, opts)
  const client = new AlbusClient(provider)
    .configure('priorityFee', Number(process.env.CLI_PRIORITY_FEE ?? 0))
    .env(env)
    .debug()
  const metaplex = Metaplex.make(provider.connection)
    .use(keypairIdentity(wallet.payer))
    .use(irysStorage({
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
