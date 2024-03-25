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
import { credential } from '@albus-finance/core'
import { circomkit, prepareInput } from './common'

describe('attendanceProof', async () => {
  const issuerKeypair = Keypair.generate()

  const claims = {
    event: 'solana-breakpoint',
    meta: {
      issuanceDate: 1697035000,
    },
  }

  let circuit: WitnessTester<[
    'expectedEvent',
    'expectedDateFrom',
    'expectedDateTo',
    'credentialRoot',
    'claimsKey',
    'claimsProof',
    'issuerPk',
    'issuerSignature',
    'trusteePublicKey',
  ]>

  beforeAll(async () => {
    circuit = await circomkit.WitnessTester('attendanceProof', {
      file: 'attendanceProof',
      template: 'AttendanceProof',
      params: [5],
    })
  })

  async function generateInput(claims: Record<string, any>, params: Record<string, any> = {}) {
    return {
      ...(await prepareInput(issuerKeypair, claims, ['event', 'meta.issuanceDate'])),
      ...params,
    } as any
  }

  it('should pass if valid input', async () => {
    const input = await generateInput(claims, {
      expectedEvent: credential.encodeClaimValue(claims.event),
      expectedDateFrom: claims.meta.issuanceDate,
      expectedDateTo: 0,
    })
    await circuit.expectPass(input)
  })

  it('should fail if invalid event code', async () => {
    const input = await generateInput(claims, {
      expectedEvent: credential.encodeClaimValue('test'),
      expectedDateFrom: 0,
      expectedDateTo: 0,
    })
    await circuit.expectFail(input)
  })

  it('should fail if invalid from date', async () => {
    const input = await generateInput(claims, {
      expectedEvent: credential.encodeClaimValue(claims.event),
      expectedDateFrom: claims.meta.issuanceDate + 86400,
      expectedDateTo: 0,
    })
    await circuit.expectFail(input)
  })

  it('should fail if invalid to date', async () => {
    const input = await generateInput(claims, {
      expectedEvent: credential.encodeClaimValue(claims.event),
      expectedDateFrom: 0,
      expectedDateTo: claims.meta.issuanceDate - 86400,
    })
    await circuit.expectFail(input)
  })
})
