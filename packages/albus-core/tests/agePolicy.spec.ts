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
import { Poseidon, babyJub, eddsa, reconstructShamirSecret } from '../src/crypto'
import { createClaimsTree } from '../src/credential'
import { formatPrivKeyForBabyJub, generateEcdhSharedKey, generateProof, verifyProof } from '../src/zkp'
import { loadFixture, setupCircuit } from './utils'

describe('AgePolicy', async () => {
  const issuerKeypair = Keypair.generate()
  const holderKeypair = Keypair.generate()

  const currentDate = 20230711
  const claims = {
    id: 0,
    birthDate: 20050711,
  }

  const issuerPk = eddsa.prv2pub(issuerKeypair.secretKey)
  // const _holderPk = eddsa.prv2pub(holderKeypair.secretKey)

  const circuit = await setupCircuit('agePolicy')

  it('valid verification', async () => {
    const tree = await createClaimsTree(claims)
    const signature = eddsa.signPoseidon(issuerKeypair.secretKey, tree.root)
    const [birthDateKey, ...birthDateProof] = await tree.proof('birthDate')

    const userPrivateKey = formatPrivKeyForBabyJub(holderKeypair.secretKey)
    const trusteeCount = 3

    const input = {
      birthDate: claims.birthDate,
      birthDateProof,
      birthDateKey,
      currentDate,
      minAge: 18,
      maxAge: 100,
      credentialRoot: tree.root,
      issuerPk,
      issuerSignature: [...signature.R8, signature.S],
      // secret: genRandomNonce(),
      userPrivateKey,
      trusteePublicKey: [],
    } as any

    for (let i = 0; i < trusteeCount; i++) {
      const trusteeKeypair = Keypair.generate()
      const trusteePublicKey = eddsa.prv2pub(trusteeKeypair.secretKey)
      input.trusteePublicKey.push(trusteePublicKey)
    }

    // console.log(input)

    const witness = await circuit.calculateWitness(input, true)
    await circuit.assertOut(witness, {})
  })

  it('invalid verification', async () => {
    // Tomorrow will be 18
    claims.birthDate += 1
    const tree = await createClaimsTree(claims)
    const signature = eddsa.signPoseidon(issuerKeypair.secretKey, tree.root)
    const [birthDateKey, ...birthDateProof] = await tree.proof('birthDate')

    const userPrivateKey = formatPrivKeyForBabyJub(holderKeypair.secretKey)
    const trusteeCount = 3

    const input = {
      birthDate: claims.birthDate,
      birthDateProof,
      birthDateKey,
      currentDate,
      minAge: 18,
      maxAge: 100,
      credentialRoot: tree.root,
      issuerPk,
      issuerSignature: [...signature.R8, signature.S],
      userPrivateKey,
      trusteePublicKey: [],
    } as any

    for (let i = 0; i < trusteeCount; i++) {
      const trusteeKeypair = Keypair.generate()
      const trusteePublicKey = eddsa.prv2pub(trusteeKeypair.secretKey)
      input.trusteePublicKey.push(trusteePublicKey)
    }

    try {
      const witness = await circuit.calculateWitness(input, true)
      await circuit.assertOut(witness, {})
      assert.ok(false)
    } catch (e: any) {
      // console.log(e.message)
      assert.include(e.message, 'Error in template AgePolicy_344')
    }
  })
})

describe('Proof', async () => {
  const issuerKeypair = Keypair.generate()
  const holderKeypair = Keypair.generate()

  const currentDate = 20230711
  const claims = {
    birthDate: '20050711',
    firstName: 'Alex',
    country: 'US',
  }

  const issuerPubkey = eddsa.prv2pub(issuerKeypair.secretKey)
  // const _holderPk = edDSA.prv2pub(holderKeypair.secretKey)

  it('poseidon encryption', async () => {
    const msg = [
      130289n,
      20230711n,
      186558642041440299711362618815710781931n,
    ]
    const secret = 186558642041440299711362618815710781931n
    const nonce = 20230711n
    const encData = Poseidon.encrypt(msg, [secret, secret], nonce)
    const data = Poseidon.decrypt(encData, [secret, secret], msg.length, nonce)
    console.log(data)
  })

  it('proof', async () => {
    const wasmFile = Uint8Array.from(loadFixture('agePolicy.wasm'))
    const zkeyFile = Uint8Array.from(loadFixture('agePolicy.zkey'))
    const vk = JSON.parse(loadFixture('agePolicy.vk.json').toString())

    const tree = await createClaimsTree(claims)
    const signature = eddsa.signPoseidon(issuerKeypair.secretKey, tree.root)
    const [birthDateKey, ...birthDateProof] = await tree.proof('birthDate')

    const userPrivateKey = formatPrivKeyForBabyJub(holderKeypair.secretKey)
    const trusteeCount = 3

    const input = {
      birthDate: claims.birthDate,
      birthDateProof,
      birthDateKey: birthDateKey!,
      currentDate,
      minAge: 18,
      maxAge: 100,
      credentialRoot: tree.root,
      issuerPk: issuerPubkey,
      issuerSignature: [...signature.R8, signature.S],
      userPrivateKey,
      trusteePublicKey: [] as bigint[][],
    }

    const holderPublicKey = eddsa.prv2pub(holderKeypair.secretKey)

    const sharedKeys: any[] = []
    for (let i = 0; i < trusteeCount; i++) {
      const trusteeKeypair = Keypair.generate()
      const trusteePublicKey = eddsa.prv2pub(trusteeKeypair.secretKey)
      input.trusteePublicKey.push(trusteePublicKey)
      sharedKeys.push(generateEcdhSharedKey(trusteeKeypair.secretKey, holderPublicKey))
      // sharedKeys.push(await generateEcdhSharedKey(holderKeypair.secretKey, trusteePublicKey))
    }

    // console.log(sharedKeys)
    // console.log('input', input)

    const { proof, publicSignals } = await generateProof({ wasmFile, zkeyFile, input })

    console.log(publicSignals)

    // reconstruct secret key

    let i = 4
    const shares: any[] = []
    for (const sharedKey of sharedKeys) {
      const share = Poseidon.decrypt([
        BigInt(publicSignals[i]!),
        BigInt(publicSignals[i + 1]!),
        BigInt(publicSignals[i + 2]!),
        BigInt(publicSignals[i + 3]!),
      ], sharedKey, 1, BigInt(input.currentDate))
      shares.push(share)
      i += 4
    }

    const decryptedSecret = reconstructShamirSecret(babyJub.F, 2, [
      [1, shares[0]],
      [2, shares[1]],
    ])

    const decryptedData = Poseidon.decrypt([
      BigInt(publicSignals[0]!),
      BigInt(publicSignals[1]!),
      BigInt(publicSignals[2]!),
      BigInt(publicSignals[3]!),
    ], [BigInt(decryptedSecret), BigInt(decryptedSecret)], 1, BigInt(input.currentDate))

    // console.log('publicSignals', publicSignals)
    // console.log('sharedKeys', sharedKeys)
    // console.log('shares', shares)
    // console.log('decryptedSecret', decryptedSecret)
    // console.log('decryptedData', decryptedData)

    assert.equal(decryptedData[0], BigInt(input.birthDate))

    const isVerified = await verifyProof({
      vk,
      proof,
      publicInput: publicSignals,
    })

    assert.ok(isVerified)
  })
})
