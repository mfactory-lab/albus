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
import { createClaimsTree } from '../src/credential'
import { eddsa } from '../src/crypto'
import { bytesToBigInt } from '../src/crypto/utils'
import { setupCircuit } from './utils'
import countries from './countries'

/**
 * Retrieve country index by iso3 code
 */
function countryIdx(code: string) {
  const idx = countries.findIndex(c => c.code3 === code)
  return idx > 0 ? idx + 1 : -1
}

enum SelectionMode {
  Inclusion = 1,
  Exclusion = 0,
}

describe('countryPolicy', async () => {
  const issuerKeypair = Keypair.generate()
  const issuerPk = eddsa.prv2pub(issuerKeypair.secretKey)

  const claims = {
    givenName: 'Mikayla',
    familyName: 'Halvorson',
    gender: 'female',
    birthDate: '19661002',
    birthPlace: 'Westland',
    nationality: 'QAT',
    country: 'QAT',
    countryOfBirth: 'QAT',
    meta: {
      validUntil: 0,
    },
  }

  async function generateInput(claims: Record<string, any>, params: Record<string, any> = {}) {
    const tree = await createClaimsTree(claims)
    const signature = eddsa.signPoseidon(issuerKeypair.secretKey, tree.root)
    const countryProof = await tree.get('country')

    return {
      credentialRoot: tree.root,
      country: countryProof.value,
      countryKey: countryProof.key,
      countryProof: countryProof.siblings,
      issuerPk,
      issuerSignature: [...signature.R8, signature.S],
      ...params,
    }
  }

  const circuit = await setupCircuit('countryPolicy')

  it('invalid country code', async () => {
    const input = await generateInput({
      ...claims,
      country: 'XXX',
    }, {
      countryLookup: [bytesToBigInt([1, 255]), 0n],
      selectionMode: SelectionMode.Inclusion,
    })
    try {
      const witness = await circuit.calculateWitness(input, true)
      await circuit.assertOut(witness, {})
    } catch (e: any) {
      assert.include(e.message, 'Error in template CountryPolicy_258 line: 56')
    }
  })

  it('valid exclusion proof', async () => {
    const input = await generateInput({
      ...claims,
      country: 'UKR', // 240
    }, {
      selectionMode: SelectionMode.Exclusion,
      // max 32 countries in one array [240, 241, ...]
      // 0n required, if select countries length < 32
      countryLookup: [bytesToBigInt([240, 241, 1, 2, 3]), 0n],
    })
    try {
      const witness = await circuit.calculateWitness(input, true)
      await circuit.assertOut(witness, {})
    } catch (e: any) {
      assert.include(e.message, 'Error in template CountryPolicy_258 line: 56')
    }
  })

  it('valid verification', async () => {
    const input = await generateInput(claims, {
      selectionMode: SelectionMode.Inclusion,
      countryLookup: [
        bytesToBigInt([1, 2, 191, 180, 15, 33, 44, 153]),
        bytesToBigInt([countryIdx(claims.country)]),
      ],
    })
    const witness = await circuit.calculateWitness(input, true)
    await circuit.assertOut(witness, {})
  })

  it('first 64 countries', async () => {
    const bytes: number[] = []
    for (let i = 0; i < 64; i++) {
      bytes[i] = i + 1
    }
    const input = await generateInput({
      ...claims,
      country: 'ERI', // index: 64
      // country: 'SVK', // index: 65
    }, {
      selectionMode: SelectionMode.Inclusion,
      countryLookup: [
        bytesToBigInt(bytes.slice(0, 32)),
        bytesToBigInt(bytes.slice(32)),
      ],
    })
    await circuit.calculateWitness(input, true)
  })

  // it('_', async () => {
  //   console.log('[')
  //   for (const c of countries) {
  //     console.log(`0x${bytesToHex(bigintToBytes(encodeClaimValue(c.code3)))}, // ${c.code3}`)
  //   }
  //   console.log(']')
  // })
})
