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

describe('LivenessProof', async () => {
  const issuerKeypair = Keypair.generate()
  const issuerPk = eddsa.prv2pub(issuerKeypair.secretKey)

  const circuit = await setupCircuit('livenessProof')

  const timestamp = 1697035401 // 2023-10-11 14:43
  const claims = {
    status: 'sumsub:selfie',
    expirationDate: 0,
  }

  async function generateInput(claims: Record<string, any>, params: Record<string, any> = {}) {
    const tree = await createClaimsTree(claims, 2)
    const statusProof = await tree.get('status')
    const expDateProof = await tree.get('expirationDate')
    const signature = eddsa.signPoseidon(issuerKeypair.secretKey, tree.root)

    return {
      timestamp,
      credentialRoot: tree.root,
      status: statusProof.value,
      statusKey: statusProof.key,
      statusProof: statusProof.siblings,
      expirationDate: expDateProof.value,
      expirationDateKey: expDateProof.key,
      expirationDateProof: expDateProof.siblings,
      issuerPk,
      issuerSignature: [...signature.R8, signature.S],
      ...params,
    }
  }

  it('valid', async () => {
    const input = await generateInput(claims, {
      expectedStatus: encodeClaimValue(claims.status),
    })
    const witness = await circuit.calculateWitness(input, true)
    await circuit.assertOut(witness, {})
  })

  it('expired', async () => {
    const input = await generateInput({
      ...claims,
      expirationDate: timestamp - 1,
    }, {
      expectedStatus: encodeClaimValue(claims.status),
    })
    try {
      const witness = await circuit.calculateWitness(input, true)
      await circuit.assertOut(witness, {})
      assert.ok(false)
    } catch (e: any) {
      console.log(e.message)
      assert.include(e.message, 'Error in template LivenessProof_253 line: 33')
    }
  })
})
