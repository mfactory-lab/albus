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

import log from 'loglevel'
import Table from 'cli-table3'
import { useContext } from '@/context'

export async function show(code: string) {
  const { client } = useContext()

  const [serviceProviderAddr] = client.pda.serviceProvider(code)
  const sp = await client.service.load(serviceProviderAddr)

  log.info('--------------------------------------------------------------------------')
  log.info(`Address ${serviceProviderAddr}`)
  log.info(sp.pretty())
  log.info('--------------------------------------------------------------------------')
}

export async function showAll(opts: { authority?: string }) {
  const { client } = useContext()

  const items = await client.service.find({
    authority: opts.authority,
  })

  const table = new Table({
    head: ['Address', 'Code', 'Name', 'Request count'],
  })

  for (const item of items) {
    table.push([item.pubkey.toString(), item.data.code, item.data.name, Number(item.data.proofRequestCount)])
  }

  console.log(table.toString())
}
