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

import type { ServiceProvider } from '@albus/sdk'
import { ProofRequestStatus } from '@albus/sdk'
import Table from 'cli-table3'
import log from 'loglevel'
import { exploreAddress } from '@/utils'
import { useContext } from '@/context'

export async function show(addr: string) {
  const { client } = useContext()

  const proofRequest = await client.loadProofRequest(addr)

  log.info('--------------------------------------------------------------------------')
  log.info(`Address: ${addr}`)
  log.info(`Service provider: ${proofRequest.serviceProvider}`)
  log.info(`Circuit: ${proofRequest.circuit}`)
  log.info(exploreAddress(proofRequest.circuit))
  log.info(`Owner: ${proofRequest.owner}`)
  log.info(exploreAddress(proofRequest.owner))
  log.info('Proof', JSON.stringify(proofRequest.proof))
  // if (zkpRequest.proof) {
  //   log.info(exploreAddress(zkpRequest.proof))
  // }
  log.info(`Created at: ${proofRequest.createdAt}`)
  log.info(`Expired at: ${proofRequest.expiredAt}`)
  log.info(`Proved at: ${proofRequest.provedAt}`)
  log.info(`Verification date: ${proofRequest.verifiedAt}`)
  log.info(`Status: ${ProofRequestStatus[proofRequest.status]}`)
  log.info('--------------------------------------------------------------------------')
}

interface SearchOpts {
  service: string
  circuit: string
  requester: string
}

export async function find(opts: SearchOpts) {
  const { client } = useContext()
  const [serviceProviderAddr] = client.getServiceProviderPDA(opts.service)
  const [zkpRequestAddr] = client.getProofRequestPDA(serviceProviderAddr, opts.circuit, opts.requester)
  await show(zkpRequestAddr.toString())
}

interface ShowAllOpts {
  service?: string
  circuit?: string
  status?: string
}

export async function showAll(opts: ShowAllOpts) {
  const { client } = useContext()

  const services = (await client.findServiceProviders())
    .reduce((a, { pubkey, data }) => {
      a.set(pubkey.toString(), data)
      return a
    }, new Map<string, ServiceProvider>())

  const items = await client.findProofRequests({
    serviceProvider: opts.service,
    circuit: opts.circuit,
    status: opts.status ? ProofRequestStatus[opts.status] : undefined,
  })

  const table = new Table({
    head: ['Address', 'Status', 'Service Provider', 'Circuit'],
  })

  for (const item of items) {
    table.push([
      String(item.pubkey),
      String(ProofRequestStatus[item.data.status]),
      String(services.get(item.data.serviceProvider.toString())?.code),
      String(item.data.circuit),
      // String(item.data.proof),
    ])
  }

  console.log(table.toString())
}
