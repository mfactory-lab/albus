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

import { beforeAll, describe, it } from 'vitest'
import type { WitnessTester } from 'circomkit'
import { Keypair } from '@solana/web3.js'
import * as Albus from '@albus-finance/core'
import { circomkit } from './common'

const { zkp } = Albus
const { eddsa } = Albus.crypto

describe('eCDH Shared Key derivation circuit', () => {
  let circuit: WitnessTester<['privateKey', 'publicKey'], ['sharedKey']>

  beforeAll(async () => {
    circuit = await circomkit.WitnessTester('ecdh', {
      file: 'utils/ecdh',
      template: 'Ecdh',
    })
  })

  it('should correctly compute an ECDH shared key', async () => {
    const sk1 = Keypair.generate().secretKey
    const sk2 = Keypair.generate().secretKey

    const pk2 = eddsa.prv2pub(sk2)

    // generate a shared key between the first private key and the second public key
    const ecdhSharedKey = zkp.generateEcdhSharedKey(sk1, pk2)

    const circuitInputs = {
      privateKey: zkp.formatPrivKeyForBabyJub(sk1),
      publicKey: pk2,
    }

    await circuit.expectPass(circuitInputs, { sharedKey: [ecdhSharedKey[0], ecdhSharedKey[1]] })
  })

  it('should generate the same shared key from the same keypairs', async () => {
    const sk1 = Keypair.generate().secretKey
    const sk2 = Keypair.generate().secretKey
    const pk1 = eddsa.prv2pub(sk1)
    const pk2 = eddsa.prv2pub(sk2)

    // generate a shared key between the first private key and the second public key
    const ecdhSharedKey = zkp.generateEcdhSharedKey(sk1, pk2)
    const ecdhSharedKey2 = zkp.generateEcdhSharedKey(sk2, pk1)

    const circuitInputs = {
      privateKey: zkp.formatPrivKeyForBabyJub(sk1),
      publicKey: pk2,
    }

    const circuitInputs2 = {
      privateKey: zkp.formatPrivKeyForBabyJub(sk2),
      publicKey: pk1,
    }

    // calculate first time witness and check contraints
    const witness = await circuit.calculateWitness(circuitInputs)
    await circuit.expectConstraintPass(witness)

    const out = await circuit.readWitnessSignals(witness, ['sharedKey'])
    await circuit.expectPass(circuitInputs, { sharedKey: ecdhSharedKey })
    await circuit.expectPass(circuitInputs2, { sharedKey: out.sharedKey! })
    await circuit.expectPass(circuitInputs2, { sharedKey: ecdhSharedKey2 })
  })

  it('should generate the same ECDH key consistently for the same inputs', async () => {
    const sk1 = Keypair.generate().secretKey
    const sk2 = Keypair.generate().secretKey
    const pk2 = eddsa.prv2pub(sk2)

    const circuitInputs = {
      privateKey: zkp.formatPrivKeyForBabyJub(sk1),
      publicKey: pk2,
    }

    // calculate first time witness and check constraints
    const witness = await circuit.calculateWitness(circuitInputs)
    await circuit.expectConstraintPass(witness)

    // read out
    const out = await circuit.readWitnessSignals(witness, ['sharedKey'])

    // calculate again
    await circuit.expectPass(circuitInputs, { sharedKey: out.sharedKey! })
  })
})
