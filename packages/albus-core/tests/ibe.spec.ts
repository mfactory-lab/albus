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
import { describe, it } from 'vitest'
import { eddsa } from '../src/crypto'
import { formatPrivKeyForBabyJub, generateEcdhSharedKey } from '../src/zkp'
import { calculateLabeledWitness, setupCircuit } from './utils'

describe('ibe', async () => {
  const userKeypair = Keypair.fromSecretKey(Uint8Array.from([
    212, 8, 96, 247, 202, 53, 207, 34, 138, 49, 164,
    72, 90, 209, 154, 57, 110, 238, 242, 165, 67, 39,
    165, 243, 55, 29, 79, 187, 39, 217, 179, 33, 187,
    164, 103, 111, 152, 173, 157, 218, 159, 250, 19, 103,
    167, 18, 37, 251, 154, 63, 218, 244, 200, 84, 43,
    228, 13, 55, 153, 138, 113, 126, 245, 28,
  ]))

  const msg = 67689268365623289906392867n

  const _userSk = formatPrivKeyForBabyJub(userKeypair.secretKey)
  const userPk = eddsa.prv2pub(userKeypair.secretKey)
  const sig = eddsa.signPoseidon(userKeypair.secretKey, msg)

  const circuit = await setupCircuit('ibe')

  it('is valid', async () => {
    const witness = await calculateLabeledWitness(circuit, {
      pk: userPk,
      signature: [sig.R8[0], sig.R8[1], sig.S],
    }, true)

    console.log(witness['main.publicKey[0]'])
    console.log(witness['main.publicKey[1]'])
    console.log(witness['main.sharedKey[0]'])
    console.log(witness['main.sharedKey[1]'])

    const shared = generateEcdhSharedKey(userKeypair.secretKey, [
      BigInt(witness['main.publicKey[0]']!),
      BigInt(witness['main.publicKey[1]']!),
    ])

    console.log(shared)
  })
})
