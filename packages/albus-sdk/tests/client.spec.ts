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

import * as Albus from '@albus-finance/core'
import { CircuitHelper } from '@albus-finance/circuits'
import { AnchorProvider, Wallet } from '@coral-xyz/anchor'
import { Connection, Keypair, PublicKey, clusterApiUrl } from '@solana/web3.js'
import { afterEach, assert, beforeAll, describe, it, vi } from 'vitest'
import type { Policy, ServiceProvider } from '../src'
import { AlbusClient, Circuit } from '../src'

const { eddsa } = Albus.crypto

describe('albusClient', async () => {
  const payerKeypair = Keypair.fromSecretKey(Uint8Array.from([
    46, 183, 156, 94, 55, 128, 248, 0, 49, 70, 183, 244, 178, 0, 0, 236, 212,
    131, 76, 78, 112, 48, 25, 79, 249, 33, 43, 158, 199, 2, 168, 18, 55, 174,
    166, 159, 57, 67, 197, 158, 255, 142, 177, 177, 47, 39, 35, 185, 148, 253,
    191, 58, 219, 119, 104, 89, 225, 26, 244, 119, 160, 6, 156, 227,
  ]))

  const now = Math.floor(Date.now() / 1000)

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
    issuerSecretKey: payerKeypair.secretKey,
    validUntil: now + 86400, // 1 day
  })

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
    const circuitHelper = new CircuitHelper('ageProof')

    let circuit: Circuit

    beforeAll(async () => {
      await circuitHelper.setup()

      const { signals } = await circuitHelper.info()

      circuit = Circuit.fromArgs({
        code: circuitHelper.circuit,
        name: circuitHelper.circuit,
        description: circuitHelper.circuit,
        vk: Albus.zkp.encodeVerifyingKey(await circuitHelper.vkey()),
        wasmUri: await circuitHelper.wasm() as any,
        zkeyUri: await circuitHelper.zkey() as any,
        privateSignals: signals.private,
        publicSignals: signals.public,
        outputs: signals.output,
        createdAt: 0,
        bump: 0,
      })
    }, 50000)

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

    it('should create proof', async () => {
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
})
