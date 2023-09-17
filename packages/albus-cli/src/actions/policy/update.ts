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

import type { PolicyRule } from '@mfactory-lab/albus-sdk'
import log from 'loglevel'
import { useContext } from '@/context'

interface Opts {
  name?: string
  description?: string
  expirationPeriod?: number
  retentionPeriod?: number
  rules?: string[]
}

export async function update(code: string, opts: Opts) {
  const { client } = useContext()

  const chunks = code.split('_')

  if (chunks.length < 2) {
    throw new Error('Invalid policy code, should be in format `{serviceCode}_{policyCode}`')
  }

  const { signature } = await client.policy.update({
    serviceCode: chunks[0]!,
    code: chunks[1]!,
    name: opts.name,
    description: opts.description,
    expirationPeriod: opts.expirationPeriod,
    retentionPeriod: opts.retentionPeriod,
    rules: opts.rules?.map((r) => {
      const rr = r.split(':')
      if (rr.length < 2) {
        throw new Error(`Invalid rule ${rr}, should be in format \`{key}:{value}\``)
      }
      return { key: String(rr[0]), value: Number(rr[1]) } as PolicyRule
    }),
  })

  log.info(`Signature: ${signature}`)
  log.info('OK')
}
