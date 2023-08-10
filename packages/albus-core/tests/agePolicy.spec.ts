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
import { buildBabyjub, buildEddsa } from 'circomlibjs'
import { assert, describe, it } from 'vitest'
import { createClaimsTree } from '../src/credential'
import { generateProof, verifyProof } from '../src/zkp'
import { loadFixture, setupCircuit } from './utils'

describe('AgePolicy', async () => {
  const issuerKeypair = Keypair.generate()
  // const holderKeypair = Keypair.generate()

  const currentDate = 20230711
  const claims = {
    id: 0,
    birthDate: 20050711,
  }

  const babyJub = await buildBabyjub()
  const edDSA = await buildEddsa()
  const issuerPk = edDSA.prv2pub(issuerKeypair.secretKey)
  // const _holderPk = edDSA.prv2pub(holderKeypair.secretKey)

  const circuit = await setupCircuit('agePolicy')

  it('valid verification', async () => {
    const tree = await createClaimsTree(claims)
    const signature = edDSA.signPoseidon(issuerKeypair.secretKey, tree.root)
    const [birthDateKey, ...birthDateProof] = await tree.proof('birthDate')

    const input = {
      birthDate: claims.birthDate,
      birthDateProof,
      birthDateKey,
      currentDate,
      minAge: 18,
      maxAge: 100,
      credentialRoot: babyJub.F.toString(tree.root),
      issuerPk: [babyJub.F.toString(issuerPk[0]), babyJub.F.toString(issuerPk[1])],
      issuerSignature: [babyJub.F.toString(signature.R8[0]), babyJub.F.toString(signature.R8[1]), String(signature.S)],
    } as any

    const witness = await circuit.calculateWitness(input, true)
    await circuit.assertOut(witness, {})
  })

  it('invalid verification', async () => {
    // Tomorrow will be 18
    claims.birthDate += 1
    const tree = await createClaimsTree(claims)
    const signature = edDSA.signPoseidon(issuerKeypair.secretKey, tree.root)
    const [birthDateKey, ...birthDateProof] = await tree.proof('birthDate')

    const input = {
      birthDate: claims.birthDate,
      birthDateProof,
      birthDateKey,
      currentDate,
      minAge: 18,
      maxAge: 100,
      credentialRoot: babyJub.F.toString(tree.root),
      issuerPk: [babyJub.F.toString(issuerPk[0]), babyJub.F.toString(issuerPk[1])],
      issuerSignature: [babyJub.F.toString(signature.R8[0]), babyJub.F.toString(signature.R8[1]), String(signature.S)],
    } as any

    try {
      const witness = await circuit.calculateWitness(input, true)
      await circuit.assertOut(witness, {})
    } catch (e: any) {
      // console.log(e.message)
      assert.include(e.message, 'Error in template AgePolicy_257') // line: 72
    }
  })
})

describe('Proof', async () => {
  const issuerKeypair = Keypair.generate()
  // const holderKeypair = Keypair.generate()

  const currentDate = 20230711
  const claims = {
    birthDate: '20050711',
    firstName: 'Alex',
    country: 'US',
  }

  const babyJub = await buildBabyjub()
  const edDSA = await buildEddsa()
  const issuerPk = edDSA.prv2pub(issuerKeypair.secretKey)
  // const _holderPk = edDSA.prv2pub(holderKeypair.secretKey)

  it('proof', async () => {
    const wasmFile = Uint8Array.from(loadFixture('agePolicy.wasm'))
    const zkeyFile = Uint8Array.from(loadFixture('agePolicy.zkey'))
    const vk = JSON.parse(loadFixture('agePolicy.vk.json').toString())

    const tree = await createClaimsTree(claims)
    const signature = edDSA.signPoseidon(issuerKeypair.secretKey, tree.root)
    const [birthDateKey, ...birthDateProof] = await tree.proof('birthDate')

    const input = {
      birthDate: claims.birthDate,
      birthDateProof,
      birthDateKey,
      currentDate,
      minAge: 18,
      maxAge: 100,
      credentialRoot: babyJub.F.toString(tree.root),
      issuerPk: [babyJub.F.toString(issuerPk[0]), babyJub.F.toString(issuerPk[1])],
      issuerSignature: [babyJub.F.toString(signature.R8[0]), babyJub.F.toString(signature.R8[1]), String(signature.S)],
    }

    const { proof, publicSignals } = await generateProof({ wasmFile, zkeyFile, input })

    const res = await verifyProof({
      vk,
      proof,
      publicInput: publicSignals,
    })

    console.log('verify', res)
  })
})
