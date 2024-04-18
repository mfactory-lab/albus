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
import type { CredentialSpec } from '@albus-finance/sdk'
import { useContext } from '@/context'

export async function show(addr: string) {
  const { client } = useContext()
  view(await client.credentialSpec.load(addr))
}

type Opts = {
  name?: string
  issuer?: string
}

export async function showAll(opts: Opts) {
  const { client } = useContext()

  const credentials = await client.credentialSpec.find({
    name: opts.name,
    issuer: opts.issuer,
  })

  if (credentials.length > 0) {
    const delim = '-'.repeat(80)
    log.info(delim)
    for (const { pubkey, data } of credentials) {
      log.info('address:', pubkey.toBase58())
      if (data) {
        view(data)
        log.info(delim)
      }
    }
  }
}

function view(data: CredentialSpec) {
  log.info(data?.pretty())
  // log.info('issuer:', data?.issuer.toBase58())
  // log.info('name:', data?.name)
  // log.info('uri:', data?.uri)
  // log.info('createdAt:', Number(data?.createdAt ?? 0))
  // log.info('credentialRequestCount:', Number(data?.credentialRequestCount ?? 0))
}
