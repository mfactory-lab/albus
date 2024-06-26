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

import Table from 'cli-table3'
import log from 'loglevel'
import * as Albus from '@albus-finance/core'
import { useContext } from '@/context'

type Opts = {
  // ...
}

export async function show(addr: string, _opts: Opts) {
  const { client } = useContext()

  const trustee = await client.trustee.load(addr)

  const zkPubkey = Albus.zkp.unpackPubkey(Uint8Array.from(trustee.key))

  log.info('\n')
  log.info({
    address: addr,
    zkPubkey,
    ...trustee.pretty(),
  })
}

type AllOpts = {
  name?: string
  email?: string
  authority?: string
  verified?: boolean
  key?: number[]
  noData?: boolean
}

export async function showAll(opts: AllOpts) {
  const { client } = useContext()

  const trustees = await client.trustee.find(opts)

  log.info(`Found ${trustees.length} account(s)`)

  const table = new Table({
    head: ['Address', 'Name', 'Email', 'Website', 'Revealed', 'Verified', 'Created'],
  })

  for (const { pubkey, data } of trustees) {
    table.push([
      pubkey.toString(),
      String(data?.name),
      String(data?.email),
      String(data?.website),
      Number(data?.revealedShareCount ?? 0),
      Boolean(data?.isVerified),
      String(new Date(Number(data!.createdAt) * 1000).toISOString()),
    ])
  }

  console.log(table.toString())

  // for (const trustee of trustees) {
  //   log.info(`Address: ${trustee.pubkey}`)
  //   log.info(trustee.data?.pretty())
  //   log.info('--------------------------------------------------------------------------')
  // }
}
