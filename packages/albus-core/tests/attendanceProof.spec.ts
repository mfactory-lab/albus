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
import { createClaimsTree, encodeClaimValue } from '../src/credential'
import { eddsa } from '../src/crypto'
import { setupCircuit } from './utils'

describe('AttendanceProof', async () => {
  const issuerKeypair = Keypair.generate()
  const issuerPk = eddsa.prv2pub(issuerKeypair.secretKey)

  const circuit = await setupCircuit('attendanceProof')

  const claims = {
    event: 'solana-breakpoint',
    meta: {
      issuanceDate: 1697035000,
    },
  }

  async function generateInput(claims: Record<string, any>, params: Record<string, any> = {}) {
    const tree = await createClaimsTree(claims, 4)
    const eventProof = await tree.get('event')
    const dateProof = await tree.get('meta.issuanceDate')
    const signature = eddsa.signPoseidon(issuerKeypair.secretKey, tree.root)

    return {
      credentialRoot: tree.root,
      event: eventProof.value,
      eventKey: eventProof.key,
      eventProof: eventProof.siblings,
      meta_issuanceDate: dateProof.value,
      meta_issuanceDateKey: dateProof.key,
      meta_issuanceDateProof: dateProof.siblings,
      issuerPk,
      issuerSignature: [...signature.R8, signature.S],
      ...params,
    }
  }

  it('valid', async () => {
    const input = await generateInput(claims, {
      expectedEvent: encodeClaimValue(claims.event),
      expectedDateFrom: claims.meta.issuanceDate,
      expectedDateTo: 0,
    })
    const witness = await circuit.calculateWitness(input, true)
    await circuit.assertOut(witness, {})
  })

  it('invalid event code', async () => {
    const input = await generateInput(claims, {
      expectedEvent: encodeClaimValue('test'),
      expectedDateFrom: 0,
      expectedDateTo: 0,
    })
    try {
      const witness = await circuit.calculateWitness(input, true)
      await circuit.assertOut(witness, {})
      assert.ok(false)
    } catch (e: any) {
      assert.include(e.message, 'Error in template AttendanceProof_255 line: 26')
    }
  })

  it('invalid from date', async () => {
    const input = await generateInput(claims, {
      expectedEvent: encodeClaimValue(claims.event),
      expectedDateFrom: claims.meta.issuanceDate + 86400,
      expectedDateTo: 0,
    })
    try {
      const witness = await circuit.calculateWitness(input, true)
      await circuit.assertOut(witness, {})
      assert.ok(false)
    } catch (e: any) {
      assert.include(e.message, 'Error in template AttendanceProof_255 line: 33')
    }
  })

  it('invalid to date', async () => {
    const input = await generateInput(claims, {
      expectedEvent: encodeClaimValue(claims.event),
      expectedDateFrom: 0,
      expectedDateTo: claims.meta.issuanceDate - 86400,
    })
    try {
      const witness = await circuit.calculateWitness(input, true)
      await circuit.assertOut(witness, {})
      assert.ok(false)
    } catch (e: any) {
      assert.include(e.message, 'Error in template AttendanceProof_255 line: 38')
    }
  })
})
