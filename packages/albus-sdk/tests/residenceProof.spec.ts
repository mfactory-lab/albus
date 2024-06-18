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

import { assert, beforeAll, describe, it } from 'vitest'
import { Keypair, PublicKey } from '@solana/web3.js'
import { CircuitHelper, countryLookup } from '@albus-finance/circuits'
import * as Albus from '@albus-finance/core'
import type { Policy } from '../src'
import { Circuit, ProofInputBuilder } from '../src'

describe('proof builder', async () => {
  const issuer = Keypair.generate()
  const user = Keypair.generate()
  const now = Math.floor(Date.now() / 1000)

  const circuitHelper = new CircuitHelper('residenceProof')

  const credential = await Albus.credential.createVerifiableCredential({
    givenName: 'Mikayla',
    familyName: 'Halvorson',
    gender: 'female',
    birthDate: '1966-10-02',
    birthPlace: 'Westland',
    nationality: 'GB',
    country: 'UA',
    countryOfBirth: 'GB',
    docType: 'ID_CARD',
    docNumber: 'AB123456',
  }, {
    issuerSecretKey: issuer.secretKey,
    validUntil: now + 86400, // 1 day
  })

  function prepareRules(value: ArrayLike<number>) {
    const arr = new Uint8Array(32)
    arr.set(Uint8Array.from(value))
    return arr.reverse()
  }

  const policy = {
    serviceProvider: PublicKey.default,
    circuit: PublicKey.default,
    code: circuitHelper.circuit,
    name: circuitHelper.circuit,
    description: '',
    expirationPeriod: 0,
    retentionPeriod: 0,
    rules: [
      {
        key: 'selectionMode',
        value: [1],
      },
      {
        key: 'countryLookup',
        value: prepareRules(
          countryLookup(['UA', 'GB', 'UA', 'IT', 'FR', 'DE', 'VA']).reverse(),
        ),
      },
    ],
  } as Policy

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
      createdAt: now,
      bump: 0,
    })
  }, 50000)

  it('works', async () => {
    const resolver: any = {
      resolve() {
        return { didDocument: Albus.utils.generateDid(issuer) } as any
      },
    }

    const vc = await Albus.credential.verifyCredential(credential, {
      resolver,
    })

    const proofInput = await new ProofInputBuilder(vc)
      .withUserPrivateKey(user.secretKey)
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

    const verified = await Albus.zkp.verifyProof({
      vk: Albus.zkp.decodeVerifyingKey(circuit.vk),
      proof: proofRequest.proof,
      publicInput: proofRequest.publicSignals as any,
    })

    assert.ok(verified)
  })
})
