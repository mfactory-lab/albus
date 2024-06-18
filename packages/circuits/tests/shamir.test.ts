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

import { assert, describe, it } from 'vitest'
import * as Albus from '@albus-finance/core'
import { circomkit } from './common'

const { babyJub, reconstructShamirSecret } = Albus.crypto

describe('shamirSecretSharing', async () => {
  const shamirN = 3
  const shamirK = 2

  const circuit = await circomkit.WitnessTester('shamir', {
    file: 'utils/shamirSecretSharing',
    template: 'ShamirSecretSharing',
    params: [shamirN, shamirK],
  })

  it('should produces a witness with valid constraints', async () => {
    const witness = await circuit.calculateWitness({ secret: 23123123123, salt: 16841814841235345n })
    await circuit.expectConstraintPass(witness)
  })

  it('should computes fragments that can reconstruct the secret', async () => {
    const testInputs = [
      { secret: 3n, salt: 15649468315n },
      { secret: 0n, salt: 48946548941654n },
      { secret: 486481648n, salt: 168418148412355n },
    ]
    for (const testInput of testInputs) {
      const witness = await circuit.calculateWitness(testInput)

      const shares = Object.values(await circuit.readWitness(witness, [
        'main.shares[0]',
        'main.shares[1]',
        'main.shares[2]',
      ]))

      const secret = reconstructShamirSecret(babyJub.F, 3, [
        [1, shares[0]!],
        [2, shares[1]!],
        [3, shares[2]!],
      ])

      assert.equal(secret, testInput.secret)
    }
  })

  it('should fails to reconstruct with invalid fragments', async () => {
    const testInput = { secret: 3n, salt: 15649468315n }

    const witness = await circuit.calculateWitness(testInput)
    const shares = Object.values(await circuit.readWitness(witness, [
      'main.shares[0]',
      'main.shares[1]',
      'main.shares[2]',
    ]))

    const secret = reconstructShamirSecret(babyJub.F, 3, [
      [1, shares[0]!],
      [2, '345278543'],
      [3, shares[2]!],
    ])

    assert.notEqual(secret, testInput.secret)
  })

  it('should reconstruct the same secret no matter which fragments are used', async () => {
    const testInput = { secret: 468146n, salt: 4564891654948n }

    const witness = await circuit.calculateWitness(testInput)
    const shares = Object.values(await circuit.readWitness(witness, [
      'main.shares[0]',
      'main.shares[1]',
      'main.shares[2]',
    ]))

    assert.equal(
      reconstructShamirSecret(babyJub.F, 2, [
        [1, shares[0]!],
        [2, shares[1]!],
      ]),
      testInput.secret,
    )

    assert.equal(
      reconstructShamirSecret(babyJub.F, 2, [
        [2, shares[1]!],
        [3, shares[2]!],
      ]),
      testInput.secret,
    )
  })
})
