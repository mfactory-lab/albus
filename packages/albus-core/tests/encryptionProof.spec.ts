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
import { reconstructShamirSecret } from '../src/crypto'
import { genRandomNonce, poseidonDecrypt } from '../src/crypto/poseidon'
import { formatPrivKeyForBabyJub, generateEcdhSharedKey } from '../src/zkp'

import { calculateLabeledWitness, setupCircuit } from './utils'

describe('encryptionProof', async () => {
  const edDSA = await buildEddsa()
  const circuit = await setupCircuit('test/encryptionProof')

  it('produces a witness with valid constraints', async () => {
    const userKeypair = Keypair.generate()
    const userPrivateKey = await formatPrivKeyForBabyJub(userKeypair.secretKey, edDSA)

    const trusteeKeypair = Keypair.generate()
    const trusteePublicKey = edDSA.prv2pub(trusteeKeypair.secretKey)
    const trusteePublicKeyFormat = trusteePublicKey.map(p => edDSA.F.toString(p))

    const shared = await generateEcdhSharedKey(userKeypair.secretKey, trusteePublicKey)

    const data = {
      userPrivateKey,
      trusteePublicKey: [
        trusteePublicKeyFormat,
        trusteePublicKeyFormat,
        trusteePublicKeyFormat,
      ],
      secret: genRandomNonce(),
      nonce: genRandomNonce(),
      data: [
        19891302,
        240,
      ],
    }

    const res = await calculateLabeledWitness(circuit, data, true)

    const decryptedData = poseidonDecrypt([
      BigInt(res['main.encryptedData[0]']),
      BigInt(res['main.encryptedData[1]']),
      BigInt(res['main.encryptedData[2]']),
      BigInt(res['main.encryptedData[3]']),
    ], [BigInt(data.secret), BigInt(data.secret)], data.data.length, data.nonce)

    console.log('decryptedData', decryptedData)

    const shares = []
    for (let i = 0; i < 3; i++) {
      const share = poseidonDecrypt([
        BigInt(res[`main.encryptedShare[${i}][0]`]),
        BigInt(res[`main.encryptedShare[${i}][1]`]),
        BigInt(res[`main.encryptedShare[${i}][2]`]),
        BigInt(res[`main.encryptedShare[${i}][3]`]),
      ], shared, 1, data.nonce)
      shares.push(share[0])
    }

    const decryptedSecret = reconstructShamirSecret(edDSA.F, 2, [
      [1, shares[0]],
      [2, shares[1]],
    ])

    console.log('shares', shares)
    console.log('secret', data.secret)
    console.log('decryptedSecret', decryptedSecret)

    // const witness = await circuit.calculateWitness(data, true)
    // console.log(await circuit.getDecoratedOutput(witness))

    // await circuit.checkConstraints(witness)
  })
})
