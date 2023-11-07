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

import { ProofRequestStatus } from '@albus-finance/sdk'
import { PublicKey } from '@solana/web3.js'
import Table from 'cli-table3'
import log from 'loglevel'
import { useContext } from '@/context'

export async function show(addr: string | PublicKey) {
  const { client } = useContext()
  const proofRequest = await client.proofRequest.load(addr)
  log.info(JSON.stringify({ address: addr, ...proofRequest.pretty() }, null, 2))
}

type ShowAllOpts = {
  service?: string
  serviceCode?: string
  circuit?: string
  circuitCode?: string
  policy?: string
  policyId?: string
  status?: ProofRequestStatus
  user?: string
}

export async function showAll(opts: ShowAllOpts) {
  const { client } = useContext()

  const services = await client.service.findMapped()
  const circuits = await client.circuit.findMapped()

  const items = await client.proofRequest.find({
    user: opts.user ? new PublicKey(opts.user) : undefined,
    serviceProvider: opts.service,
    serviceProviderCode: opts.serviceCode,
    circuit: opts.circuit,
    circuitCode: opts.circuitCode,
    policy: opts.policy,
    policyId: opts.policyId,
    status: opts.status,
  })

  const table = new Table({
    head: ['#', 'Address', 'Status', 'Service', 'Circuit', 'Date'],
  })

  let i = 0
  for (const { pubkey, data } of items) {
    // item.data.
    table.push([
      String(++i),
      String(pubkey),
      String(ProofRequestStatus[data!.status]),
      String(services.get(data!.serviceProvider.toString())?.code),
      String(circuits.get(data!.circuit.toString())?.code),
      String(new Date(Number(data!.createdAt) * 1000).toISOString()),
      // String(item.data.proof),
    ])
  }

  console.log(table.toString())
}
