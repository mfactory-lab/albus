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
import { readFileSync } from 'node:fs'
import { AnchorProvider, Wallet, web3 } from '@coral-xyz/anchor'
import { AlbusClient } from '@albus-finance/sdk'
import log from 'loglevel'
import { Keypair } from '@solana/web3.js'
import { useContext } from '@/context'
import { clusterUrl } from '@/utils'

export async function migrate(_opts: any) {
  const { client } = useContext()

  // mainnet connection
  const opts = AnchorProvider.defaultOptions()
  const keypair = process.env.CLI_SOLANA_MAINNET_KEYPAIR!
  const wallet = new Wallet(
    Keypair.fromSecretKey(Buffer.from(JSON.parse(
      keypair.startsWith('[') && keypair.endsWith(']') ? keypair : readFileSync(keypair).toString(),
    ))),
  )
  const endpoint = process.env.CLI_SOLANA_MAINNET_CLUSTER ?? clusterUrl('mainnet-beta')
  const connection = new web3.Connection(endpoint, opts.commitment)
  const _prodClient = new AlbusClient(new AnchorProvider(connection, wallet, opts))

  log.info('Loading from mainnet...')
  const issuers = await client.issuer.find()

  // for (const issuer of issuers) {
  //   prodClient.issuer.create({
  //     code: string
  //     name: string
  //   })
  // }
  console.log(issuers)
}
