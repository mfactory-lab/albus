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
import { eddsa } from '../src/crypto'
import { formatPrivKeyForBabyJub } from '../src/zkp'
import { bytesToBigInt } from '../src/crypto/utils'
import { createClaimsTree } from '../src/credential'
import { setupCircuit } from './utils'

describe('newPolicy', async () => {
  const holderKeypair = Keypair.generate()
  const userPrivateKey = formatPrivKeyForBabyJub(holderKeypair.secretKey)

  const issuerKeypair = Keypair.generate()
  const issuerPk = eddsa.prv2pub(issuerKeypair.secretKey)

  const timestamp = 1697035401 // 2023-10-11 14:43
  const claims = {
    givenName: 'Mikayla',
    familyName: 'Halvorson',
    gender: 'female',
    birthDate: '1966-10-02',
    birthPlace: 'Westland',
    nationality: 'GB',
    country: 'GB',
    countryOfBirth: 'GB',
    docNumber: 'AB123456',
    meta: {
      validUntil: timestamp + 1,
    },
  }

  function countryLookup(countries: string[]) {
    return bytesToBigInt(countries.reduce((a, b) => {
      a.push(...new TextEncoder().encode(b))
      return a
    }, [] as number[]))
  }

  async function generateInput(claims: Record<string, any>) {
    const tree = await createClaimsTree(claims)
    const signature = eddsa.signPoseidon(issuerKeypair.secretKey, tree.root)

    const usedClaims = ['givenName', 'familyName', 'birthDate', 'country', 'docNumber', 'meta.validUntil']
    const trusteeCount = 3

    const claimsProof: bigint[][] = []
    const keys: number[] = []
    const values: Record<string, bigint> = {}
    for (const key of usedClaims) {
      const treeClaim = await tree.get(key)
      if (!treeClaim.found) {
        throw new Error(`invalid claim ${key}`)
      }
      keys.push(Number(treeClaim.key))
      claimsProof.push(treeClaim.siblings)
      values[key.replace('.', '_')] = treeClaim.value
    }

    bytesToBigInt(['UA', 'GB'].reduce((a, b) => {
      a.push(...new TextEncoder().encode(b))
      return a
    }, [] as number[]))

    const input = {
      timestamp,
      config: [
        bytesToBigInt([18, 0, 1].reverse()),
        countryLookup(['UA', 'GB']),
      ],
      credentialRoot: tree.root,
      claimsKey: bytesToBigInt(keys.reverse()),
      claimsProof,
      ...values,
      issuerPk,
      issuerSignature: [...signature.R8, signature.S],
      trusteePublicKey: [] as any,
      userPrivateKey,
    }

    for (let i = 0; i < trusteeCount; i++) {
      const trusteeKeypair = Keypair.generate()
      const trusteePublicKey = eddsa.prv2pub(trusteeKeypair.secretKey)
      input.trusteePublicKey.push(trusteePublicKey)
    }

    console.log(input)

    return input
  }

  it('_', async () => {
    const circuit = await setupCircuit('test/test')
    const witness = await circuit.calculateWitness({
      // in: 232396204657573373161521n,
      in: 48,
    }, true)
    await circuit.assertOut(witness, {})

    // console.log(claims.meta.validUntil)
    // console.log(encodeClaimValue(claims.meta.validUntil))

    // const n = bigintToBytes(256n)
    // console.log(n)
  })

  it('works', async () => {
    const circuit = await setupCircuit('newPolicy')
    const input = await generateInput(claims)
    const witness = await circuit.calculateWitness(input, true)
    await circuit.assertOut(witness, {})
  })
})
