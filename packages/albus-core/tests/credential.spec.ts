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
import { babyJub, eddsa } from '../src/crypto'
import {
  createClaimsTree,
  createCredentialProof,
  createVerifiableCredential,
  createVerifiablePresentation,
  encryptVerifiablePresentation,
  verifyCredential,
  verifyCredentialProof,
  verifyPresentation,
} from '../src/credential'

describe('credential', () => {
  const claims = {
    birthDate: '19890101',
    firstName: 'Alex',
    country: 'US',
    alumniOf: {
      name: 'Example University',
    },
    degree: {
      type: 'BachelorDegree',
      name: 'Bachelor of Science and Arts',
    },
  }

  const issuerKeypair = Keypair.fromSecretKey(Uint8Array.from([
    150, 232, 72, 116, 118, 190, 184, 233, 180, 142, 79,
    28, 230, 201, 241, 99, 143, 64, 133, 92, 114, 38,
    178, 85, 162, 156, 222, 236, 53, 103, 158, 16, 72,
    161, 0, 27, 144, 34, 30, 176, 234, 34, 29, 159,
    129, 212, 83, 67, 105, 12, 176, 230, 43, 99, 203,
    48, 145, 183, 41, 211, 84, 39, 240, 58,
  ]))

  it('can create and verify credential proof', async () => {
    const claimsTree = await createClaimsTree(claims)
    const issuerKeypair = Keypair.generate()
    const pubkey = babyJub.packPoint(eddsa.prv2pub(issuerKeypair.secretKey))
    const proof = createCredentialProof({
      rootHash: claimsTree.root,
      signerSecretKey: issuerKeypair.secretKey,
      verificationMethod: '',
    })
    const res = verifyCredentialProof(proof, pubkey)
    assert.ok(res)
  })

  it('can create and verify credential', async () => {
    const holder = Keypair.generate()

    const data = await createVerifiableCredential(claims, {
      userPublicKey: holder.publicKey,
      encrypt: true,
      issuerSecretKey: issuerKeypair.secretKey,
    })

    // console.log(JSON.stringify(data, null, 2))

    assert.ok('encrypted' in data.credentialSubject)
    assert.ok('proof' in data)

    const vc = await verifyCredential(data, {
      decryptionKey: holder.secretKey,
      // TODO: mock web resolver
      // resolver: {}
    })

    // assert.ok('issuerPubkey' in vc)
    assert.ok('credentialSubject' in vc)
    assert.deepEqual(vc.credentialSubject, claims)
  })

  it('can create and verify presentation', async () => {
    const holder = Keypair.generate()

    const credential = await createVerifiableCredential(claims, {
      userPublicKey: holder.publicKey,
      encrypt: true,
      issuerSecretKey: issuerKeypair.secretKey,
    })

    const payload = await createVerifiablePresentation({
      holderSecretKey: holder.secretKey,
      exposedFields: ['birthDate', 'degree.type'],
      credentials: [credential],
    })

    assert.ok('encrypted' in payload.verifiableCredential![0]!.credentialSubject)

    const vp = await verifyPresentation(payload, { decryptionKey: holder.secretKey })

    assert.deepEqual(vp.verifiableCredential?.[0]?.credentialSubject, {
      birthDate: claims.birthDate,
      degree: { type: claims.degree.type },
    })
  })

  it('can create presentation with all exposed claims', async () => {
    const holder = Keypair.generate()

    const credential = await createVerifiableCredential(claims, {
      userPublicKey: holder.publicKey,
      encrypt: true,
      issuerSecretKey: issuerKeypair.secretKey,
    })

    console.log(JSON.stringify(credential, null, 2))

    const presentation = await createVerifiablePresentation({
      holderSecretKey: holder.secretKey,
      credentials: [credential],
    })

    const encryptedPresentation = await encryptVerifiablePresentation(presentation, {
      pubkey: holder.publicKey,
    })

    // console.log(JSON.stringify(encryptedPresentation, null, 2))

    const vp = await verifyPresentation(encryptedPresentation, { decryptionKey: holder.secretKey })

    const { '@proof': proof, ...exposedClaims } = vp.verifiableCredential?.[0]?.credentialSubject as any

    assert.ok(vp.verifiableCredential?.length === 1)
    assert.deepEqual(exposedClaims, claims)
    assert.deepEqual(Object.keys(proof), Object.keys(exposedClaims))
  })

  it('claimsTree', async () => {
    const claims = {
      degree: {
        type: 'BachelorDegree',
        name: 'Bachelor of Science and Arts',
        university: {
          name: 'test',
        },
      },
      test: [1, 2, 3],
      test2: [{ name: '1' }],
      birthDate: '1989-01-01',
      firstName: 'Alex',
      country: 'US',
    }

    const tree = await createClaimsTree(claims)

    console.log((await tree.get('degree.name')))

    assert.equal((await tree.get('birthDate')).key, 7n)
    assert.equal((await tree.get('degree.university.name')).key, 2n)
    assert.equal((await tree.get('test2.0.name')).value, 1n)
  })
})
