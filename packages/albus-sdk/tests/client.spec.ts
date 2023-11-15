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

import { readFileSync } from 'node:fs'
import * as Albus from '@albus-finance/core'
import { AnchorProvider, Wallet } from '@coral-xyz/anchor'
import { Connection, Keypair, PublicKey, clusterApiUrl } from '@solana/web3.js'
import { afterEach, assert, describe, it, vi } from 'vitest'
import type { Circuit, Policy, ServiceProvider } from '../src'
import { AlbusClient } from '../src'
import { ProofInputBuilder } from '../src/utils'

const { eddsa } = Albus.crypto
describe('albusClient', async () => {
  const payerKeypair = Keypair.fromSecretKey(Uint8Array.from([
    46, 183, 156, 94, 55, 128, 248, 0, 49, 70, 183, 244, 178, 0, 0, 236, 212,
    131, 76, 78, 112, 48, 25, 79, 249, 33, 43, 158, 199, 2, 168, 18, 55, 174,
    166, 159, 57, 67, 197, 158, 255, 142, 177, 177, 47, 39, 35, 185, 148, 253,
    191, 58, 219, 119, 104, 89, 225, 26, 244, 119, 160, 6, 156, 227,
  ]))

  const client = new AlbusClient(new AnchorProvider(
    new Connection(clusterApiUrl('devnet')),
    new Wallet(payerKeypair),
    AnchorProvider.defaultOptions(),
  ))

  afterEach(() => {
    vi.restoreAllMocks()
  })

  const serviceProvider = {
    code: 'acme',
    name: 'acme',
    trustees: [
      PublicKey.default,
      PublicKey.default,
      PublicKey.default,
    ],
  } as ServiceProvider

  describe('ageProof', async () => {
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

    const policy = {
      serviceProvider: PublicKey.default,
      circuit: PublicKey.default,
      code: 'age',
      name: 'age',
      description: '',
      expirationPeriod: 0,
      retentionPeriod: 0,
      rules: [
        {
          key: 'minAge',
          value: Array.from(Albus.crypto.ffUtils.beInt2Buff(18n, 32)),
        },
        {
          key: 'maxAge',
          value: Array.from(Albus.crypto.ffUtils.beInt2Buff(100n, 32)),
        },
      ],
    } as Policy

    const now = Math.floor(Date.now() / 1000)

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
      issuerSecretKey: payerKeypair.secretKey,
      validUntil: now + 86400, // 1 day
    })

    it('can packPubkey and unpackPubkey', async () => {
      const keypair = Keypair.generate()
      const key = Albus.zkp.packPubkey(eddsa.prv2pub(keypair.secretKey))
      assert.ok(Albus.zkp.unpackPubkey(key) !== null)
    })

    it('prepareInputs', async () => {
      const user = Keypair.generate()
      const prv = Albus.zkp.formatPrivKeyForBabyJub(user.secretKey)

      const inputs = await new ProofInputBuilder(credential)
        .withUserPrivateKey(prv)
        .withTrusteePublicKey([[1n, 2n], [1n, 2n], [1n, 2n]])
        .withPolicy(policy)
        .withCircuit(circuit)
        .build()

      const data = inputs.data

      assert.equal(data.meta_validUntil, now + 86400)
      assert.equal(data.meta_validUntilKey, 2)
      assert.equal(data.meta_validUntilProof.length, 5)
      assert.equal(data.birthDate, '19661002')
      assert.equal(data.birthDateKey, 7n)
      assert.equal(data.birthDateProof.length, 5)
      assert.equal(data.issuerPk.length, 2)
      assert.equal(data.issuerSignature.length, 3)
      assert.deepEqual(data.trusteePublicKey, [[1n, 2n], [1n, 2n], [1n, 2n]])
    })

    it('prove', async () => {
      vi.spyOn(client.credential, 'load').mockReturnValue(Promise.resolve(credential))
      vi.spyOn(client.proofRequest, 'getTimestamp').mockReturnValue(Promise.resolve(1697035401))
      // vi.spyOn(client.circuit, 'load').mockReturnValue(Promise.resolve(circuit))
      // vi.spyOn(client.policy, 'load').mockReturnValue(Promise.resolve(policy))

      vi.spyOn(client.proofRequest, 'loadFull').mockReturnValue(Promise.resolve({
        proofRequest: {
          circuit: PublicKey.default,
          policy: PublicKey.default,
        },
        circuit,
        policy,
        serviceProvider,
      } as any))

      const trusteeCount = 3
      const trusteePublicKeys: [bigint, bigint][] = []
      for (let i = 0; i < trusteeCount; i++) {
        const trusteeKeypair = Keypair.generate()
        const trusteePublicKey = eddsa.prv2pub(trusteeKeypair.secretKey)
        trusteePublicKeys.push(trusteePublicKey)
      }

      vi.spyOn(client.service, 'loadTrusteeKeys').mockReturnValue(Promise.resolve(trusteePublicKeys))
      vi.spyOn(client.provider, 'sendAll').mockReturnValue(Promise.resolve(['abc123']))

      const {
        signatures,
        proof,
        publicSignals,
      } = await client.proofRequest.fullProve({
        // exposedFields: circuit.privateSignals,
        userPrivateKey: payerKeypair.secretKey,
        proofRequest: PublicKey.default,
        vc: PublicKey.default,
      })

      const isVerified = await Albus.zkp.verifyProof({
        vk: Albus.zkp.decodeVerifyingKey(circuit.vk),
        proof,
        // @ts-expect-error readonly
        publicInput: publicSignals,
      })

      assert.ok(isVerified)
      assert.equal(signatures[0], 'abc123')
    })
  })

  describe('attendanceProof', async () => {
    const issuer = Keypair.generate()

    const event = 'test1'

    const circuit = {
      code: 'attendance',
      name: 'attendance',
      vk: Albus.zkp.encodeVerifyingKey(JSON.parse(loadFixture('attendanceProof.vk.json').toString())),
      wasmUri: loadFixture('attendanceProof.wasm'),
      zkeyUri: loadFixture('attendanceProof.zkey'),
      outputs: [],
      privateSignals: ['event', 'meta_issuanceDate'],
      publicSignals: [
        'expectedEvent',
        'expectedDateFrom',
        'expectedDateTo',
        'eventKey',
        'eventProof[4]',
        'meta_issuanceDateKey',
        'meta_issuanceDateProof[4]',
        'credentialRoot',
        'issuerPk[2]',
        'issuerSignature[3]',
      ],
    } as unknown as Circuit

    const policy = {
      serviceProvider: PublicKey.default,
      circuit: PublicKey.default,
      code: 'attendancePolicy',
      name: 'attendancePolicy',
      description: '',
      expirationPeriod: 0,
      retentionPeriod: 0,
      rules: [
        { key: 'expectedEvent', value: Array.from(Albus.crypto.ffUtils.beInt2Buff(Albus.credential.encodeClaimValue(event), 32)) },
        { key: 'expectedDateFrom', value: Array.from(Albus.crypto.ffUtils.beInt2Buff(0n, 32)) },
        { key: 'expectedDateTo', value: Array.from(Albus.crypto.ffUtils.beInt2Buff(0n, 32)) },
      ],
    } as Policy

    const credential = await Albus.credential.createVerifiableCredential({
      event,
    }, {
      issuerSecretKey: issuer.secretKey,
      // validUntil: Math.floor(Date.now() / 1000) + 86400,
    })

    it ('is valid proof', async () => {
      vi.spyOn(client.credential, 'load').mockReturnValue(Promise.resolve(credential))
      vi.spyOn(client.proofRequest, 'getTimestamp').mockReturnValue(Promise.resolve(1697035401))
      vi.spyOn(client.proofRequest, 'loadFull').mockReturnValue(Promise.resolve({
        proofRequest: { circuit: PublicKey.default, policy: PublicKey.default },
        circuit,
        policy,
        serviceProvider,
      } as any))

      const trusteePublicKeys: [bigint, bigint][] = []
      for (let i = 0; i < 3; i++) {
        const trusteeKeypair = Keypair.generate()
        const trusteePublicKey = eddsa.prv2pub(trusteeKeypair.secretKey)
        trusteePublicKeys.push(trusteePublicKey)
      }

      vi.spyOn(client.service, 'loadTrusteeKeys').mockReturnValue(Promise.resolve(trusteePublicKeys))
      vi.spyOn(client.provider, 'sendAll').mockReturnValue(Promise.resolve(['abc123']))

      const { signatures, proof, publicSignals } = await client.proofRequest.fullProve({
        // exposedFields: circuit.privateSignals,
        userPrivateKey: payerKeypair.secretKey,
        proofRequest: PublicKey.default,
        vc: PublicKey.default,
      })

      const isVerified = await Albus.zkp.verifyProof({
        vk: Albus.zkp.decodeVerifyingKey(circuit.vk),
        proof,
        // @ts-expect-error readonly
        publicInput: publicSignals,
      })

      assert.ok(isVerified)
      assert.equal(signatures[0], 'abc123')

      // const proofInput = await new ProofInputBuilder(credential)
      //   .withUserPrivateKey(prv)
      //   .withTrusteePublicKey([[1n, 2n], [1n, 2n], [1n, 2n]])
      //   .withPolicy(policy)
      //   .withCircuit(circuit)
      //   .build()
      //
      // // console.log(proofInput.data)
      //
      // const { proof, publicSignals } = await Albus.zkp.generateProof({
      //   wasmFile: circuit.wasmUri,
      //   zkeyFile: circuit.zkeyUri,
      //   input: proofInput.data,
      // })
      //
      // console.log(proof)
      // console.log(publicSignals)
    })
  })

  describe('livenessProof', () => {
    const credential = {
      '@context': [
        'https://www.w3.org/ns/credentials/v2',
      ],
      'type': [
        'VerifiableCredential',
        'AlbusCredential',
        'LivenessProof',
      ],
      'issuer': 'did:web:issuer.albus.finance:sumsub',
      'issuanceDate': '2023-10-25T16:42:27.642Z',
      'credentialSubject': {
        type: 'sumsub:selfie',
      },
      'proof': {
        type: 'BJJSignature2021',
        created: 1698252147857,
        verificationMethod: 'did:web:issuer.albus.finance:sumsub#eddsa-bjj',
        rootHash: '7384168670000218909495559690876868525986254131057443973562604756255281925274',
        proofValue: {
          ax: '12279242631152480922448440387665898145185461262650789258320537467533451473248',
          ay: '562652728416453518865033172714223342104200904426339863473937692826883086980',
          r8x: '2851062159973030482641259574782771657093068370484615714955983721583034367029',
          r8y: '15202688401997695193545614335173659064939108058226998945381729092286514966694',
          s: '70776040370476481594455779101978946705154142135311648660435454303144753412',
        },
        proofPurpose: 'assertionMethod',
      },
    }

    const expectedType = 'sumsub:selfie'

    const circuit = {
      code: 'liveness',
      name: 'liveness',
      vk: Albus.zkp.encodeVerifyingKey(JSON.parse(loadFixture('livenessProof.vk.json').toString())),
      wasmUri: loadFixture('livenessProof.wasm'),
      zkeyUri: loadFixture('livenessProof.zkey'),
      outputs: [],
      privateSignals: ['meta_validUntil', 'type'],
      publicSignals: [
        'timestamp',
        'expectedType',
        'credentialRoot',
        'meta_validUntilKey',
        'meta_validUntilProof[4]',
        'typeKey',
        'typeProof[4]',
        'issuerPk[2]',
        'issuerSignature[3]',
      ],
    } as unknown as Circuit

    const policy = {
      serviceProvider: PublicKey.default,
      circuit: PublicKey.default,
      code: 'livenessProof',
      name: 'livenessProof',
      description: '',
      expirationPeriod: 0,
      retentionPeriod: 0,
      rules: [
        { key: 'expectedType', value: Array.from(Albus.crypto.ffUtils.beInt2Buff(Albus.credential.encodeClaimValue(expectedType), 32)) },
      ],
    } as Policy

    it('valid', async () => {
      vi.spyOn(client.credential, 'load').mockReturnValue(Promise.resolve(credential))
      vi.spyOn(client.proofRequest, 'getTimestamp').mockReturnValue(Promise.resolve(1697035401))
      vi.spyOn(client.proofRequest, 'loadFull').mockReturnValue(Promise.resolve({
        proofRequest: { circuit: PublicKey.default, policy: PublicKey.default },
        circuit,
        policy,
        serviceProvider,
      } as any))

      vi.spyOn(client.provider, 'sendAll').mockReturnValue(Promise.resolve(['abc123']))

      const { signatures, proof, publicSignals } = await client.proofRequest.fullProve({
        userPrivateKey: payerKeypair.secretKey,
        proofRequest: PublicKey.default,
        vc: PublicKey.default,
      })

      const isVerified = await Albus.zkp.verifyProof({
        vk: Albus.zkp.decodeVerifyingKey(circuit.vk),
        proof,
        // @ts-expect-error readonly
        publicInput: publicSignals,
      })

      assert.ok(isVerified)
      assert.equal(signatures[0], 'abc123')
    })
  })
})

export function loadFixture(name: string) {
  return readFileSync(`../../tests/fixtures/${name}`)
}
