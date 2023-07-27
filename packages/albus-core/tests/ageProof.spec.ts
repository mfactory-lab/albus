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
import { setupCircuit } from './utils'

describe('ageProof', async () => {
  const input = {
    birthYear: 2005,
    birthMonth: 7,
    birthDay: 11,
    currentYear: 2023,
    currentMonth: 7,
    currentDay: 11,
    minAge: 18,
    maxAge: 100,
  }

  const circuit = await setupCircuit('test/ageProof')

  it('accept valid birth date', async () => {
    const witness = await circuit.calculateWitness(input, true)
    await circuit.assertOut(witness, { valid: 1 })
  })

  it('decline invalid birth date', async () => {
    input.birthDay += 1
    const witness = await circuit.calculateWitness(input, true)
    await circuit.assertOut(witness, { valid: 0 })
  })
})
