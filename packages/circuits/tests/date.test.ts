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

import { describe, it } from 'vitest'
import { credential } from '@albus-finance/core'
import { circomkit } from './common'

describe('date', async () => {
  it('parseDate', async () => {
    const circuit = await circomkit.WitnessTester('parseDate', {
      file: 'utils/date',
      template: 'ParseDate',
    })
    const date = [1989, 11, 30]
    await circuit.expectPass({
      in: credential.encodeClaimValue(date.join('-')),
    }, {
      out: date,
    })
  })

  it('str2Timestamp', async () => {
    const circuit = await circomkit.WitnessTester('str2Timestamp', {
      file: 'utils/date',
      template: 'Str2Timestamp',
    })
    await circuit.expectPass({
      in: 232396204657573373161521n,
    }, {
      out: 1697039001,
    })
  })

  it('timestampToDate', async () => {
    const circuit = await circomkit.WitnessTester('timestampToDate', {
      file: 'test/_date',
      template: 'TimestampToDate',
    })
    await circuit.expectPass({ in: 1697068800 }, { out: [2023, 10, 12] })
  })

  it('dateToTimestamp', async () => {
    const circuit = await circomkit.WitnessTester('dateToTimestamp', {
      file: 'test/_date',
      template: 'DateToTimestamp',
    })
    await circuit.expectPass({ in: [2023, 10, 12] }, { out: 1697068800 })
  })
})
