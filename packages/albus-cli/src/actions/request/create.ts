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
import { show } from './show'
import { useContext } from '@/context'
import { exploreTransaction } from '@/utils'

type Opts = {
  // Expires in seconds
  expiresIn?: number
}

export async function create(policy: string, opts: Opts) {
  const { client } = useContext()

  const [serviceCode, policyCode] = policy.split('_')
  if (!serviceCode || !policyCode) {
    throw new Error('Invalid policy id, must be in format `{serviceCode}_{policyCode}`')
  }

  try {
    const { signature, address } = await client.proofRequest.create({
      serviceCode,
      policyCode,
      expiresIn: opts.expiresIn,
    }, { commitment: 'confirmed' })

    log.info(`Signature: ${signature}`)
    log.info(exploreTransaction(signature))

    await show(address)
  } catch (e) {
    log.error(e)
  }
}
