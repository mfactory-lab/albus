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
import { encodeClaimValue } from '../src/credential'
import { setupCircuit } from './utils'

describe('parseDate', async () => {
  const circuit = await setupCircuit('test/parseDate')

  const date = [1989, 11, 30]
  it('works', async () => {
    const witness = await circuit.calculateWitness({
      date: encodeClaimValue(date.join('-')),
    }, true)
    await circuit.assertOut(witness, { out: date })
  })
})

describe('dateToTimestamp', async () => {
  const input = {
    year: 2020,
    month: 12,
    day: 31,
  }

  const circuit = await setupCircuit('test/dateToTimestamp')

  it('works', async () => {
    const date = new Date(`${input.year}-${input.month}-${input.day}`)
    const witness = await circuit.calculateWitness(input, true)
    await circuit.assertOut(witness, { out: date.getTime() / 1000 })
  })
})

describe('timestampToDate', async () => {
  const input = {
    timestamp: 1697068800,
  }

  const circuit = await setupCircuit('test/timestampToDate')

  it('works', async () => {
    const witness = await circuit.calculateWitness(input, true)
    await circuit.assertOut(witness, { out: [2023, 10, 12] })
  })
})
