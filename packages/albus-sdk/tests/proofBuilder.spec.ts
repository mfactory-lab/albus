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
import * as Albus from '@albus-finance/core'
import { Keypair } from '@solana/web3.js'
import type { Circuit } from '../src'
import { loadFixture } from './client.spec'

describe('proof builder', async () => {
  const issuer = Keypair.generate()
  const user = Keypair.generate()
  const now = Math.floor(Date.now() / 1000)

  const circuit = {
    code: 'age',
    name: 'Age',
    vk: Albus.zkp.encodeVerifyingKey(JSON.parse(loadFixture('agePolicy.vk.json').toString())),
    wasmUri: loadFixture('agePolicy.wasm'),
    zkeyUri: loadFixture('agePolicy.zkey'),
    outputs: [
      'encryptedData[4]',
      'encryptedShare[3][4]',
      'userPublicKey[2]',
    ],
    privateSignals: [
      'birthDate',
      'userPrivateKey',
      'meta_validUntil',
    ],
    publicSignals: [
      'timestamp',
      'minAge',
      'maxAge',
      'credentialRoot',
      'meta_validUntilKey',
      'meta_validUntilProof[5]',
      'birthDateKey',
      'birthDateProof[5]',
      'issuerPk[2]',
      'issuerSignature[3]',
      'trusteePublicKey[3][2]',
    ],
  } as unknown as Circuit

  const credential = await Albus.credential.createVerifiableCredential({
    givenName: 'Mikayla',
    familyName: 'Halvorson',
    gender: 'female',
    birthDate: '19661002',
    birthPlace: 'Westland',
    nationality: 'MNE',
    country: 'MNE',
    countryOfBirth: 'MNE',
  }, {
    issuerSecretKey: issuer.secretKey,
    validUntil: now + 86400, // 1 day
  })

  // const inputs = await new ProofInputBuilder(credential)
  //   .withUserPrivateKey(user.secretKey)
  //   .withTrusteePublicKey([[1n, 2n], [1n, 2n], [1n, 2n]])
  //   .withPolicy(policy)
  //   .withCircuit(circuit)
  //   .build()

  it('works', async () => {
    //
  })
})
