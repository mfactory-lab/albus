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
import { useContext } from '../../../context'

export async function show(code: string) {
  const { client } = useContext()

  const [serviceProviderAddr] = client.getServiceProviderPDA(code)
  const sp = await client.loadServiceProvider(serviceProviderAddr)

  log.info('--------------------------------------------------------------------------')
  log.info(`Address ${serviceProviderAddr}`)
  log.info(`Authority: ${sp.authority}`)
  log.info(`Code: ${sp.code}`)
  log.info(`Name: ${sp.name}`)
  log.info(`ZKP request's count: ${sp.zkpRequestCount}`)
  log.info(`Creation time: ${sp.createdAt}`)
  log.info('--------------------------------------------------------------------------')
}

export async function showAll(opts: { authority?: string }) {
  const { client } = useContext()

  const items = await client.loadAllServiceProviders({
    authority: opts.authority,
  })

  log.info('--------------------------------------------------------------------------')
  log.info('Code | Name | Address | Request count')
  log.info('--------------------------------------------------------------------------')

  for (const item of items) {
    log.info(`${item.data.code} | ${item.data.name} | ${item.pubkey} | ${item.data.zkpRequestCount}`)
    log.info('--------------------------------------------------------------------------')
  }
}
