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

import { Keypair } from '@solana/web3.js'
import { buildEddsa } from 'circomlibjs'
import { describe, it } from 'vitest'

import { groth16 } from 'snarkjs'
import { reconstructShamirSecret } from '../src/crypto'
import { bytesToFinite } from '../src/zkp'
import { loadFixture, setupCircuit } from './utils'

describe('Shamir\'s secret sharing', async () => {
  const issuerKeypair = Keypair.generate()
  const edDSA = await buildEddsa()
  const circuit = await setupCircuit('test/shamirSecretSharing')

  it('produces a witness with valid constraints', async () => {
    const witness = await circuit.calculateWitness({ secret: 3, salt: 15649468315 }, true)
    await circuit.checkConstraints(witness)
  })

  const wasmFile = Uint8Array.from(loadFixture('shamirSecretSharing.wasm'))
  const zkeyFile = Uint8Array.from(loadFixture('shamirSecretSharing.zkey'))

  it('computes fragments that can reconstruct the secret', async () => {
    console.log(issuerKeypair.secretKey)
    console.log(bytesToFinite(issuerKeypair.secretKey))

    const testInputs = [
      // { secret: 12345, salt: 23323d3434 },
      { secret: bytesToFinite(issuerKeypair.secretKey).slice(0, 64), salt: '16841814841235345' },
    ]

    for (const testInput of testInputs) {
      const { _, publicSignals } = await groth16.fullProve(testInput, wasmFile, zkeyFile)

      console.log('testInput', testInput)
      console.log(publicSignals)

      const res = reconstructShamirSecret(edDSA.F, 3, [
        [1, publicSignals[0]],
        [2, publicSignals[1]],
        [3, publicSignals[2]],
      ])

      console.log(res)
    }
  })
})
