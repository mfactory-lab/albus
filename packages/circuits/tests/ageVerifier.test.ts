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
import { circomkit } from './common'

describe('ageVerifier', async () => {
  const input = {
    currentDate: [2023, 7, 11],
    birthDate: [2005, 7, 11],
    minAge: 18,
    maxAge: 0,
  }

  const circuit = await circomkit.WitnessTester('ageProof', {
    file: 'utils/age',
    template: 'AgeVerifier',
  })

  it('should accept valid birth date', async () => {
    await circuit.expectPass(input, { valid: 1 })
  })

  it('should decline large birth date', async () => {
    await circuit.expectPass({
      ...input,
      birthDate: [2003, 7, 10],
      maxAge: 20,
    }, { valid: 0 })
  })

  it('should decline small birth date', async () => {
    await circuit.expectPass({
      ...input,
      birthDate: [2005, 7, 12],
    }, { valid: 0 })
  })
})
