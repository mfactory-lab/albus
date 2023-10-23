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

import { PublicKey } from '@solana/web3.js'
import log from 'loglevel'
import Table from 'cli-table3'
import { useContext } from '@/context'

export async function show(code: string) {
  const { client } = useContext()

  let serviceProviderAddr: PublicKey
  try {
    serviceProviderAddr = new PublicKey(code)
  } catch (e) {
    serviceProviderAddr = client.pda.serviceProvider(code)[0]
  }

  const service = await client.service.load(serviceProviderAddr)

  log.info(`Address: ${serviceProviderAddr}`)
  log.info(service.pretty())
}

export async function showAll(opts: { authority?: string }) {
  const { client } = useContext()

  const items = await client.service.find({
    authority: opts.authority,
  })

  const table = new Table({
    head: ['Address', 'Code', 'Name', 'Trustee count', 'Policy count', 'Request count'],
  })

  for (const { pubkey, data } of items) {
    table.push([
      pubkey.toString(),
      String(data?.code),
      String(data?.name),
      // String(data?.authority),
      Number(data?.trustees.length ?? 0),
      Number(data?.policyCount),
      Number(data?.proofRequestCount),
    ])
  }

  console.log(table.toString())
}
