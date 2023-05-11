/*
 * This file is part of Albus code.
 *
 * Copyright (c) 2023, jFactory GmbH
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
 * The developer of this program can be contacted at <info@jfactory.ch>.
 */

import { PublicKey } from '@solana/web3.js'
import log from 'loglevel'
import { useContext } from '../../context'

interface Opts {}

/**
 * Verify ZKP request
 */
export async function verifyRequest(addr: string, _opts: Opts) {
  const { client } = useContext()

  log.debug('Verifying proof...')
  const isVerified = await client.verifyZKPRequest(addr)
  log.debug('Status:', isVerified)

  try {
    log.debug('Update on-chain status...')
    if (isVerified) {
      await client.verify({ zkpRequest: new PublicKey(addr) })
      log.debug('Verified!')
    } else {
      await client.reject({ zkpRequest: new PublicKey(addr) })
      log.debug('Rejected!')
    }
  } catch (e) {
    log.error(e)
  }

  process.exit(0)
}
