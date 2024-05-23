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
import { beforeAll, describe, it } from 'vitest'
import type { WitnessTester } from 'circomkit'
import { crypto } from '@albus-finance/core'
import { countryLookup } from '../src'
import { circomkit, prepareInput } from './common'

describe('residenceProof', async () => {
  const issuerKeypair = Keypair.generate()

  const credentialDepth = 5
  const countryLookupSize = 1

  const timestamp = 1697035401 // 2023-10-11 14:43

  const claims = {
    country: 'GB',
    meta: {
      validUntil: timestamp + 1,
    },
  }

  let circuit: WitnessTester<[
    'selectionMode',
    'countryLookup',
    'credentialRoot',
    'countryKey',
    'countryProof',
    'issuerPk',
    'issuerSignature',
    'trusteePublicKey',
  ]>

  beforeAll(async () => {
    circuit = await circomkit.WitnessTester('residenceProof', {
      file: 'residenceProof',
      template: 'ResidenceProof',
      params: [credentialDepth, countryLookupSize],
    })
  })

  async function generateInput(claims: Record<string, any>, params: Record<string, any> = {}) {
    return {
      ...(await prepareInput(issuerKeypair, claims, ['country', 'meta.validUntil'])),
      timestamp,
      ...params,
    } as any
  }

  it('should pass if country is in the allowed list', async () => {
    const input = await generateInput(claims, {
      selectionMode: 1,
      countryLookup: [
        crypto.utils.bytesToBigInt(countryLookup(['UA', 'GB'])),
      ],
    })
    await circuit.expectPass(input)
  })

  it('should fail if country is not in the allowed list', async () => {
    const input = await generateInput(claims, {
      selectionMode: 1,
      countryLookup: [
        crypto.utils.bytesToBigInt(countryLookup(['UA'])),
      ],
    })
    await circuit.expectFail(input)
  })

  it('should pass if country is not in the excluded list', async () => {
    const input = await generateInput(claims, {
      selectionMode: 0,
      countryLookup: [
        crypto.utils.bytesToBigInt(countryLookup(['UA'])),
      ],
    })
    await circuit.expectPass(input)
  })

  it('should fail if country is in the excluded list', async () => {
    const input = await generateInput(claims, {
      selectionMode: 0,
      countryLookup: [
        crypto.utils.bytesToBigInt(countryLookup(['UA', 'GB'])),
      ],
    })
    await circuit.expectFail(input)
  })
})
