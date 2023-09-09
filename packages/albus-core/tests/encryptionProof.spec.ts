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
import { babyJub, eddsa } from '@iden3/js-crypto'
import { assert, describe, it } from 'vitest'
import { genRandomNonce, poseidonDecrypt, reconstructShamirSecret } from '../src/crypto'
import { formatPrivKeyForBabyJub, generateEcdhSharedKey } from '../src/zkp'
import { calculateLabeledWitness, setupCircuit } from './utils'

describe('encryptionProof', async () => {
  const circuit = await setupCircuit('test/encryptionProof')

  it('produces a witness with valid constraints', async () => {
    const userKeypair = Keypair.generate()
    const userPrivateKey = formatPrivKeyForBabyJub(userKeypair.secretKey)

    const trusteeKeypair = Keypair.generate()
    const trusteePublicKey = eddsa.prv2pub(trusteeKeypair.secretKey)
    const shared = generateEcdhSharedKey(userKeypair.secretKey, trusteePublicKey)

    const data = {
      userPrivateKey,
      trusteePublicKey: [
        trusteePublicKey,
        trusteePublicKey,
        trusteePublicKey,
      ],
      secret: genRandomNonce(),
      nonce: genRandomNonce(),
      data: [
        19891302n,
        240n,
      ],
    }

    const res = await calculateLabeledWitness(circuit, data, true)

    const decryptedData = poseidonDecrypt([
      BigInt(res['main.encryptedData[0]']!),
      BigInt(res['main.encryptedData[1]']!),
      BigInt(res['main.encryptedData[2]']!),
      BigInt(res['main.encryptedData[3]']!),
    ], [BigInt(data.secret), BigInt(data.secret)], data.data.length, data.nonce)

    assert.deepEqual(decryptedData, data.data)

    // console.log('decryptedData', decryptedData)

    const shares: any[] = []
    for (let i = 0; i < 3; i++) {
      const share = poseidonDecrypt([
        BigInt(res[`main.encryptedShare[${i}][0]`]!),
        BigInt(res[`main.encryptedShare[${i}][1]`]!),
        BigInt(res[`main.encryptedShare[${i}][2]`]!),
        BigInt(res[`main.encryptedShare[${i}][3]`]!),
      ], shared, 1, data.nonce)
      shares.push(share[0])
    }

    const decryptedSecret = reconstructShamirSecret(babyJub.F, 2, [
      [1, shares[0]],
      [2, shares[1]],
    ])

    assert.equal(BigInt(decryptedSecret), data.secret)

    // console.log('shares', shares)
    // console.log('secret', data.secret)
    // console.log('decryptedSecret', decryptedSecret)

    // const witness = await circuit.calculateWitness(data, true)
    // console.log(await circuit.getDecoratedOutput(witness))

    // await circuit.checkConstraints(witness)
  })
})
