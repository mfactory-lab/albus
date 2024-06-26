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
import { describe, it } from 'vitest'
import { ClaimsTree } from '../../albus-core/src/credential'
import { circomkit, prepareInput } from './common'

describe('typeProof', async () => {
  const issuerKeypair = Keypair.generate()

  const credentialDepth = 2

  const circuit = await circomkit.WitnessTester('typeProof', {
    file: 'typeProof',
    template: 'TypeProof',
    params: [credentialDepth, 1],
  })

  const timestamp = 1697035401 // 2023-10-11 14:43

  const claims = {
    meta: {
      type: 'IdCard',
      validUntil: 0,
    },
  }

  async function generateInput(claims: Record<string, any>, params: Record<string, any> = {}) {
    return {
      ...(await prepareInput(issuerKeypair, claims, ['meta.type', 'meta.validUntil'], credentialDepth)),
      ...params,
    } as any
  }

  it('valid', async () => {
    const input = await generateInput(claims, {
      timestamp,
      expectedType: ClaimsTree.encodeValue(claims.meta.type),
    })
    await circuit.expectPass(input)
  })

  it('invalid type', async () => {
    const input = await generateInput({
      ...claims,
      meta: {
        ...claims.meta,
        type: ClaimsTree.encodeValue('invalid'),
      },
    }, {
      timestamp,
      expectedType: ClaimsTree.encodeValue(claims.meta.type),
    })
    await circuit.expectFail(input)
  })

  it('expired', async () => {
    const input = await generateInput({
      ...claims,
      meta: {
        ...claims.meta,
        validUntil: timestamp,
      },
    }, {
      timestamp,
      expectedType: ClaimsTree.encodeValue(claims.meta.type),
    })
    await circuit.expectFail(input)
  })
})
