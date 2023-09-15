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
import { useContext } from '@/context'

export async function showAll() {
  const { client } = useContext()

  const services = await client.service.findMapped()
  const circuits = await client.circuit.findMapped()

  log.info('Loading all policies...')
  const policies = await client.policy.find()

  log.info('--------------------------------------------------------------------------')

  for (const policy of policies) {
    log.info('Address:', policy.pubkey.toString())
    log.info('ServiceCode:', services.get(policy.data!.serviceProvider.toString())?.code)
    log.info('CircuitCode:', circuits.get(policy.data!.circuit.toString())?.code)
    log.info(policy.data?.pretty())
    log.info('--------------------------------------------------------------------------')
  }
}
