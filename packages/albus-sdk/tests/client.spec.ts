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
    vk: Albus.zkp.decodeVerifyingKey(JSON.parse(loadFixture('agePolicy.vk.json').toString())),
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

  it('verify', async () => {
    console.log('alpha', JSON.stringify(circuit.vk.alpha))
    console.log('beta', JSON.stringify(circuit.vk.beta))
    console.log('gamma', JSON.stringify(circuit.vk.gamma))
    console.log('delta', JSON.stringify(circuit.vk.delta))
    console.log('ic', JSON.stringify(circuit.vk.ic))

    const proof = {
      pi_a: [
        '9513184565394393143933342473718217193608627292375513158858785238768232051444',
        '11194127647625964356760202649265034362446672797245931973040460815469044784206',
        '1',
      ],
      pi_b: [
        [
          '5160581714131215737433033261691939636461300733735454425107120536605599105412',
          '9568246434219080482642981991846804548734416157852999459498765424798662935966',
        ],
        [
          '15973983858381534851133299003045335269315578185823000455494813080395540314227',
          '18143764010723306730833184780438740090320127934136942362718020385996854010060',
        ],
        ['1', '0'],
      ],
      pi_c: [
        '2303571472400084599104830798671005606362785069462490266623106305622834147867',
        '9749635137688832975371947829586635026183637740451006615199544090016877970072',
        '1',
      ],
      protocol: 'groth16',
      curve: 'bn128',
    }
    const publicInput = [
      '353086023020879629087888673454917369147465163855843886593149553676241948357',
      '495667492475991330422281750651009254772949868345543114298160384197425362394',
      '0',
      '0',
      '0',
      '0',
      '0',
      '20230729',
      '18',
      '100',
      '11077866633106981791340789987944870806147307639065753995447310137530607758623',
      '20841523997579262969290434121704327723902935194219264790567899027938554056663',
      '20678780156819015018034618985253893352998041677807437760911245092739191906558',
      '21153906701456715004295579276500758430977318622340395655171725984189489403836',
      '15484492519285437260388749074045005694239822857741052851485555393361224949130',
      '1662767948258934355069791443487100820038153707701411290986741440889424297316',
    ]

    vi.spyOn(client.circuit, 'load').mockReturnValue(Promise.resolve(circuit))

    assert.ok(await client.verify({
      circuit: PublicKey.default,
      proof,
      publicInput,
    }))
  })

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

    const { signature, proof, publicSignals, presentationUri } = await client.prove({
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

  // it('utils.currentDate', async () => {
  //   console.log(await client.utils.currentDate())
  // })
})

export function loadFixture(name: string) {
  return readFileSync(`../../circuits/${name}`)
}
