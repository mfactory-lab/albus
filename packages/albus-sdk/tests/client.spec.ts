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
import { AnchorProvider, Wallet } from '@coral-xyz/anchor'
import { Connection, Keypair, PublicKey, clusterApiUrl } from '@solana/web3.js'
import { describe, it, vi } from 'vitest'
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
    new Connection(clusterApiUrl('mainnet-beta')),
    new Wallet(payerKeypair),
    AnchorProvider.defaultOptions(),
  ))

  it('prove', async () => {
    const circuit = {
      code: 'age',
      name: 'Age',
      wasmUri: loadFixture('agePolicy.wasm'),
      zkeyUri: loadFixture('agePolicy.zkey'),
      privateSignals: ['birthDate'],
      publicSignals: [
        'currentDate', 'minAge', 'maxAge',
        'credentialRoot', 'birthDateProof[6]', 'birthDateKey',
        'issuerPk[2]', 'issuerSignature[3]',
      ],
    } as unknown as Circuit

    const policy = {
      name: 'policy',
      description: 'policy',
      rules: [
        { index: 1, value: client.utils.normalizePublicInput(18) },
        { index: 2, value: client.utils.normalizePublicInput(100) },
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

    vi.spyOn(client.proofRequest, 'prove').mockReturnValue(Promise.resolve({
      signature: 'abc123',
    } as any))

    vi.spyOn(client.storage, 'uploadData').mockReturnValue(Promise.resolve(
      'http://localhost/mock.json',
    ))

    await client.prove({
      exposedFields: ['birthDate'],
      holderSecretKey: payerKeypair.secretKey,
      proofRequest: PublicKey.default,
      vc: PublicKey.default,
    })
  })

  // it('utils.currentDate', async () => {
  //   console.log(await client.utils.currentDate())
  // })
})

export function loadFixture(name: string) {
  return readFileSync(`../../circuits/${name}`)
}
