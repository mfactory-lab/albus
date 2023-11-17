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
import { assert, describe, it } from 'vitest'
import { eddsa } from '../src/crypto'
import { formatPrivKeyForBabyJub, generateEcdhSharedKey } from '../src/zkp'
import { calculateLabeledWitness, setupCircuit } from './utils'

describe('ecdh', async () => {
  const circuit = await setupCircuit('test/ecdh')

  it('produces a witness with valid constraints', async () => {
    const userKeypair = Keypair.generate()
    const userPublicKey = eddsa.prv2pub(userKeypair.secretKey)
    const userPrivateKey = formatPrivKeyForBabyJub(userKeypair.secretKey)

    const otherKeypair = Keypair.generate()
    const otherPublicKey = eddsa.prv2pub(otherKeypair.secretKey)

    const shared = generateEcdhSharedKey(userKeypair.secretKey, otherPublicKey)
    const shared2 = generateEcdhSharedKey(otherKeypair.secretKey, userPublicKey)

    assert.equal(String(shared), String(shared2))

    const data = {
      privateKey: userPrivateKey,
      publicKey: otherPublicKey,
    }

    const res = await calculateLabeledWitness(circuit, data, true)

    assert.equal(String(shared), String([
      res['main.sharedKey[0]'],
      res['main.sharedKey[1]'],
    ]))
  })
})
