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

import { ZKPRequestStatus } from '@albus/sdk'
import log from 'loglevel'
import { useContext } from '../../context'
import { exploreAddress } from '../../utils'

export async function show(addr: string) {
  const { client } = useContext()

  const zkpRequest = await client.loadZKPRequest(addr)

  log.info('--------------------------------------------------------------------------')
  log.info(`Address: ${addr}`)
  log.info(`Service provider: ${zkpRequest.serviceProvider}`)
  log.info(`Circuit: ${zkpRequest.circuit}`)
  log.info(exploreAddress(zkpRequest.circuit))
  log.info(`Owner: ${zkpRequest.owner}`)
  log.info(exploreAddress(zkpRequest.owner))
  log.info(`Proof: ${zkpRequest.proof}`)
  if (zkpRequest.proof) {
    log.info(exploreAddress(zkpRequest.proof))
  }
  log.info(`Created at: ${zkpRequest.createdAt}`)
  log.info(`Expired at: ${zkpRequest.expiredAt}`)
  log.info(`Proved at: ${zkpRequest.provedAt}`)
  log.info(`Verification date: ${zkpRequest.verifiedAt}`)
  log.info(`Status: ${ZKPRequestStatus[zkpRequest.status]}`)
  log.info('--------------------------------------------------------------------------')
}

interface SearchOpts {
  sp: string
  circuit: string
  requester: string
}

export async function find(opts: SearchOpts) {
  const { client } = useContext()
  const [serviceProviderAddr] = client.getServiceProviderPDA(opts.sp)
  const [zkpRequestAddr] = client.getZKPRequestPDA(serviceProviderAddr, opts.circuit, opts.requester)
  await show(zkpRequestAddr.toString())
}

interface ShowAllOpts {
  sp?: string
  circuit?: string
  proof?: string
}

export async function showAll(opts: ShowAllOpts) {
  const { client } = useContext()

  const items = await client.findZKPRequests({
    serviceProvider: opts.sp,
    circuit: opts.circuit,
    proof: opts.proof,
  })

  log.info('--------------------------------------------------------------------------')
  log.info('Address | Circuit | Service Provider | Proof | Requester')
  log.info('--------------------------------------------------------------------------')

  for (const item of items) {
    log.info(`${item.pubkey} | ${item.data.circuit} | ${item.data.serviceProvider} | ${item.data.proof} | ${item.data.owner}`)
    log.info('--------------------------------------------------------------------------')
  }
}
