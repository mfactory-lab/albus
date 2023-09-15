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

import type { ProofRequestStatus } from '@mfactory-lab/albus-sdk'
import { PublicKey } from '@solana/web3.js'
import Table from 'cli-table3'
import { useContext } from '@/context'

interface Opts {
  serviceCode?: string
  circuit?: string
  circuitCode?: string
  policy?: string
  policyId?: string
  status?: ProofRequestStatus
}

export async function showAll(userAddr: string, opts: Opts) {
  const { client } = useContext()

  const items = await client.proofRequest.find({
    user: new PublicKey(userAddr),
    serviceProviderCode: opts.serviceCode,
    circuit: opts.circuit,
    circuitCode: opts.circuitCode,
    policy: opts.policy,
    policyId: opts.policyId,
    status: opts.status,
  })

  const table = new Table({
    head: ['Address', 'Circuit', 'Service Provider', 'Requester', 'Proof'],
  })

  for (const item of items) {
    table.push([
      String(item.pubkey),
      String(item.data?.circuit),
      String(item.data?.serviceProvider),
      String(item.data?.owner),
      // String(item.data.proof),
    ])
  }

  // process.exit(0)
}
