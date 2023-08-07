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

import { readFileSync } from 'node:fs'
import * as Albus from '@albus/core'
import { AnchorProvider, Wallet } from '@coral-xyz/anchor'
import { Connection, Keypair, PublicKey, clusterApiUrl } from '@solana/web3.js'
import { afterEach, assert, describe, expect, it, vi } from 'vitest'
import type { Circuit, Policy } from '../src'
import { AlbusClient } from '../src'

describe('AlbusClient', () => {
  const payerKeypair = Keypair.fromSecretKey(Uint8Array.from([
    46, 183, 156, 94, 55, 128, 248, 0, 49, 70, 183, 244, 178, 0, 0, 236, 212, 131,
    76, 78, 112, 48, 25, 79, 249, 33, 43, 158, 199, 2, 168, 18, 55, 174, 166, 159,
    57, 67, 197, 158, 255, 142, 177, 177, 47, 39, 35, 185, 148, 253, 191, 58, 219,
    119, 104, 89, 225, 26, 244, 119, 160, 6, 156, 227,
  ]))

  const client = new AlbusClient(new AnchorProvider(
    new Connection(clusterApiUrl('devnet')),
    new Wallet(payerKeypair),
    AnchorProvider.defaultOptions(),
  ))

  afterEach(() => {
    vi.restoreAllMocks()
  })

  const circuit = {
    code: 'age',
    name: 'Age',
    vk: Albus.zkp.encodeVerifyingKey(JSON.parse(loadFixture('agePolicy.vk.json').toString())),
    wasmUri: loadFixture('agePolicy.wasm'),
    zkeyUri: loadFixture('agePolicy.zkey'),
    privateSignals: ['birthDate'],
    publicSignals: [
      'birthDateProof[6]', 'birthDateKey',
      'currentDate', 'minAge', 'maxAge',
      'credentialRoot', 'issuerPk[2]', 'issuerSignature[3]',
    ],
  } as unknown as Circuit

  // it('credentials', async () => {
  //   await client.credential.loadAll()
  // })

  it('prove', async () => {
    const policy = {
      name: 'policy',
      description: 'policy',
      rules: [
        { index: 8, group: 0, value: 18 },
        { index: 9, group: 0, value: 100 },
      ],
    } as unknown as Policy

    vi.spyOn(client.credential, 'load').mockReturnValue(Promise.resolve({
      '@context': [
        'https://www.w3.org/2018/credentials/v1',
      ],
      'type': [
        'VerifiableCredential',
        'AlbusCredential',
      ],
      'issuer': 'did:web:albus.finance',
      'issuanceDate': '2023-07-27T00:12:43.635Z',
      'credentialSubject': {
        birthDate: '19890101',
        firstName: 'Alex',
        country: 'US',
      },
      'proof': {
        type: 'BJJSignature2021',
        created: 1690416764498,
        verificationMethod: 'did:web:albus.finance#keys-0',
        rootHash: '11077866633106981791340789987944870806147307639065753995447310137530607758623',
        proofValue: {
          ax: '20841523997579262969290434121704327723902935194219264790567899027938554056663',
          ay: '20678780156819015018034618985253893352998041677807437760911245092739191906558',
          r8x: '21153906701456715004295579276500758430977318622340395655171725984189489403836',
          r8y: '15484492519285437260388749074045005694239822857741052851485555393361224949130',
          s: '1662767948258934355069791443487100820038153707701411290986741440889424297316',
        },
        proofPurpose: 'assertionMethod',
      },
    } as any))

    vi.spyOn(client.circuit, 'load').mockReturnValue(Promise.resolve(circuit))
    vi.spyOn(client.policy, 'load').mockReturnValue(Promise.resolve(policy))

    vi.spyOn(client.proofRequest, 'loadFull').mockReturnValue(Promise.resolve({
      proofRequest: { circuit: PublicKey.default, policy: PublicKey.default },
      circuit,
      policy,
    } as any))

    const proveSpy = vi.spyOn(client.proofRequest, 'prove')
      .mockReturnValue(Promise.resolve({
        signature: 'abc123',
      } as any))

    const storageSpy = vi.spyOn(client.storage, 'uploadData')
      .mockReturnValue(Promise.resolve(
        'http://localhost/mock.json',
      ))

    const { signature, proof, publicSignals, presentationUri } = await client.proofRequest.fullProve({
      exposedFields: circuit.privateSignals,
      holderSecretKey: payerKeypair.secretKey,
      proofRequest: PublicKey.default,
      vc: PublicKey.default,
    })

    assert.equal(publicSignals.length, 16)
    assert.ok(proof !== undefined)
    assert.equal(signature, 'abc123')
    assert.equal(presentationUri, 'http://localhost/mock.json')

    expect(proveSpy).toHaveBeenCalledTimes(1)
    expect(storageSpy).toHaveBeenCalledTimes(1)
  })

  it('verify', async () => {
    const proof = { a: [35, 9, 56, 130, 46, 68, 65, 212, 204, 98, 78, 113, 33, 70, 56, 191, 255, 221, 43, 190, 238, 56, 74, 56, 230, 18, 234, 226, 192, 141, 205, 10, 46, 193, 38, 2, 142, 88, 8, 158, 45, 152, 22, 203, 240, 86, 144, 125, 123, 105, 127, 26, 235, 240, 67, 193, 155, 196, 138, 53, 145, 43, 254, 179], b: [32, 89, 3, 32, 141, 116, 113, 99, 151, 140, 103, 123, 54, 42, 8, 164, 10, 119, 238, 228, 156, 116, 158, 115, 108, 72, 197, 132, 74, 155, 6, 85, 32, 133, 75, 77, 153, 148, 61, 27, 181, 19, 80, 77, 47, 51, 0, 87, 203, 104, 177, 69, 238, 19, 112, 142, 53, 253, 211, 100, 245, 164, 0, 90, 23, 54, 86, 71, 156, 243, 245, 7, 189, 209, 95, 58, 85, 18, 187, 227, 66, 165, 226, 62, 226, 207, 47, 1, 202, 30, 141, 97, 83, 160, 192, 138, 37, 70, 33, 164, 37, 115, 102, 146, 231, 253, 188, 162, 44, 142, 141, 204, 76, 241, 168, 88, 212, 48, 201, 159, 118, 193, 177, 76, 255, 242, 92, 87], c: [47, 180, 233, 78, 155, 215, 17, 177, 224, 20, 126, 62, 109, 132, 115, 69, 59, 86, 196, 241, 128, 127, 144, 112, 158, 22, 7, 118, 100, 75, 178, 249, 32, 45, 36, 165, 174, 51, 92, 64, 99, 132, 48, 50, 3, 235, 245, 203, 47, 54, 214, 111, 3, 86, 252, 34, 37, 77, 99, 91, 167, 218, 213, 199] }
    const publicInputs = [[0, 199, 214, 240, 123, 172, 248, 120, 228, 226, 80, 170, 126, 30, 175, 137, 146, 226, 184, 21, 10, 234, 158, 225, 179, 97, 99, 42, 178, 165, 78, 197], [1, 24, 137, 177, 30, 45, 57, 167, 210, 172, 227, 148, 76, 91, 156, 16, 58, 67, 90, 245, 67, 148, 118, 22, 242, 95, 231, 130, 15, 199, 245, 218], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 52, 178, 151], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 18], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 100], [24, 125, 217, 174, 133, 40, 203, 118, 245, 106, 154, 122, 19, 50, 71, 225, 18, 147, 174, 184, 246, 177, 138, 220, 37, 203, 36, 131, 167, 224, 109, 31], [46, 19, 226, 114, 3, 228, 121, 0, 203, 132, 50, 204, 165, 145, 251, 3, 242, 141, 38, 88, 124, 50, 248, 61, 218, 182, 181, 189, 88, 230, 143, 215], [45, 183, 198, 89, 118, 191, 150, 159, 106, 184, 128, 72, 245, 119, 147, 210, 107, 183, 226, 219, 241, 216, 158, 67, 9, 92, 26, 98, 61, 107, 160, 254], [46, 196, 175, 216, 123, 42, 24, 178, 16, 98, 164, 254, 143, 46, 79, 106, 229, 141, 49, 13, 188, 75, 245, 196, 75, 161, 118, 58, 149, 60, 215, 188], [34, 59, 233, 132, 237, 149, 239, 141, 62, 114, 113, 160, 135, 11, 50, 26, 18, 8, 164, 169, 71, 229, 111, 227, 32, 231, 29, 61, 112, 192, 93, 138], [3, 173, 23, 227, 2, 43, 181, 73, 139, 193, 142, 183, 238, 255, 98, 64, 170, 184, 200, 150, 126, 198, 90, 126, 220, 16, 104, 57, 239, 125, 189, 100]]

    vi.spyOn(client.circuit, 'load').mockReturnValue(Promise.resolve(circuit))
    vi.spyOn(client.proofRequest, 'load').mockReturnValue(Promise.resolve({
      circuit,
      proof,
      publicInputs,
    } as any))

    assert.ok(await client.proofRequest.verify({
      proofRequest: PublicKey.default,
    }))
  })

  // it('utils.currentDate', async () => {
  //   console.log(await client.utils.currentDate())
  // })
})

export function loadFixture(name: string) {
  return readFileSync(`../../circuits/${name}`)
}
