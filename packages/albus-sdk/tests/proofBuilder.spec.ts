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
import { Keypair, PublicKey } from '@solana/web3.js'
import type { Circuit, Policy } from '../src'
import { ProofInputBuilder } from '../src'
import { loadFixture } from './client.spec'

describe('proof builder', async () => {
  const issuer = Keypair.generate()
  const user = Keypair.generate()
  const now = Math.floor(Date.now() / 1000)

  const circuit = {
    code: 'kyc',
    name: 'kyc',
    vk: Albus.zkp.encodeVerifyingKey(JSON.parse(loadFixture('kycPolicy.vk.json').toString())),
    wasmUri: loadFixture('kycPolicy.wasm'),
    zkeyUri: loadFixture('kycPolicy.zkey'),
    outputs: [
      'encryptedData[7]',
      'encryptedShare[3][4]',
      'userPublicKey[2]',
    ],
    privateSignals: [
      'givenName',
      'familyName',
      'birthDate',
      'country',
      'docNumber',
      'meta_validUntil',
      'userPrivateKey',
    ],
    publicSignals: [
      'timestamp',
      'config',
      'countryLookup[2]',
      'credentialRoot',
      'claimKey',
      'claimProof[3]',
      'issuerPk[2]',
      'issuerSignature[3]',
      'trusteePublicKey[3][2]',
    ],
  } as unknown as Circuit

  const credential = await Albus.credential.createVerifiableCredential({
    givenName: 'Mikayla',
    familyName: 'Halvorson',
    gender: 'female',
    birthDate: '1966-10-02',
    birthPlace: 'Westland',
    nationality: 'GB',
    country: 'GB',
    countryOfBirth: 'GB',
    docType: 'ID_CARD',
    docNumber: 'AB123456',
  }, {
    issuerSecretKey: issuer.secretKey,
    validUntil: now + 86400, // 1 day
  })

  const config = {
    minAge: 18,
    maxAge: 0,
    selectionMode: 1,
  }

  const policy = {
    serviceProvider: PublicKey.default,
    circuit: PublicKey.default,
    code: 'kyc',
    name: 'kyc',
    description: '',
    expirationPeriod: 0,
    retentionPeriod: 0,
    rules: [
      {
        key: 'config',
        value: [config.minAge, config.maxAge, config.selectionMode].reverse(),
      },
      {
        key: 'countryLookup',
        value: countryLookup(['UA', 'GB']),
      },
    ],
  } as Policy

  it('works', async () => {
    const proofInput = await new ProofInputBuilder(credential)
      .withUserPrivateKey(user.secretKey)
      .withTrusteePublicKey([[1n, 2n], [1n, 2n], [1n, 2n]])
      .withTimestamp(now)
      .withPolicy(policy)
      .withCircuit(circuit)
      .build()

    const proofData = {
      wasmFile: circuit.wasmUri,
      zkeyFile: circuit.zkeyUri,
      input: proofInput.data,
    }

    const proofRequest = await Albus.zkp.generateProof(proofData)

    const userSecret = Albus.crypto.Poseidon.hash([
      proofInput.data.userPrivateKey,
      proofInput.data.credentialRoot,
      proofInput.data.timestamp,
    ])

    const decryptedData = Albus.crypto.Poseidon.decrypt(
      proofRequest.publicSignals.slice(0, 7).map(BigInt),
      [userSecret, userSecret],
      5,
      proofInput.data.timestamp,
    )
      .map(Albus.credential.decodeClaimValue)

    assert.equal(decryptedData[0], credential.credentialSubject.givenName)
    assert.equal(decryptedData[1], credential.credentialSubject.familyName)
    assert.equal(decryptedData[2], credential.credentialSubject.birthDate)
    assert.equal(decryptedData[3], credential.credentialSubject.country)
    assert.equal(decryptedData[4], credential.credentialSubject.docNumber)

    await Albus.zkp.verifyProof({
      vk: Albus.zkp.decodeVerifyingKey(circuit.vk),
      proof: proofRequest.proof,
      publicInput: proofRequest.publicSignals as any,
    })
  })
})

function countryLookup(iso2Codes: string[]) {
  if (iso2Codes.length > 16) {
    throw new Error('countryLookup cannot have more than 16 codes')
  }
  const encoder = new TextEncoder()
  return iso2Codes.reduce((acc, code) => {
    acc.push(...encoder.encode(code))
    return acc
  }, [] as number[])
}
