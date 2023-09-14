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
import * as Albus from '@mfactory-lab/albus-core'
import { AnchorProvider, Wallet } from '@coral-xyz/anchor'
import { Connection, Keypair, PublicKey, clusterApiUrl } from '@solana/web3.js'
import { afterEach, assert, describe, it, vi } from 'vitest'
import type { Circuit, Policy, ServiceProvider } from '../src'
import { AlbusClient } from '../src'
import { ProofInputBuilder } from '../src/utils'

const { eddsa } = Albus.crypto
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

  const serviceProvider = {
    code: 'acme',
    name: 'acme',
    trustees: [
      PublicKey.default,
      PublicKey.default,
      PublicKey.default,
    ],
  } as ServiceProvider

  const circuit = {
    code: 'age',
    name: 'Age',
    vk: Albus.zkp.encodeVerifyingKey(JSON.parse(loadFixture('agePolicy.vk.json').toString())),
    wasmUri: loadFixture('agePolicy.wasm'),
    zkeyUri: loadFixture('agePolicy.zkey'),
    outputs: [
      'encryptedData[4]',
      'encryptedShare[3][4]',
    ],
    privateSignals: [
      'birthDate',
      'userPrivateKey',
    ],
    publicSignals: [
      'currentDate',
      'minAge',
      'maxAge',
      'credentialRoot',
      'birthDateProof[6]',
      'birthDateKey',
      'issuerPk[2]',
      'issuerSignature[3]',
      'trusteePublicKey[3][2]',
    ],
  } as unknown as Circuit

  const policy = {
    serviceProvider: PublicKey.default,
    circuit: PublicKey.default,
    code: 'policy',
    name: 'policy',
    description: 'policy',
    expirationPeriod: 0,
    retentionPeriod: 0,
    rules: [
      { key: 'minAge', value: 18 },
      { key: 'maxAge', value: 100 },
    ],
  } as Policy

  const credential = {
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
  }

  it('can packPubkey and unpackPubkey', async () => {
    const keypair = Keypair.generate()
    const key = Albus.zkp.packPubkey(eddsa.prv2pub(keypair.secretKey))
    assert.ok(Albus.zkp.unpackPubkey(key) !== null)
  })

  it('prepareInputs', async () => {
    const user = Keypair.generate()
    const prv = Albus.zkp.formatPrivKeyForBabyJub(user.secretKey)

    const inputs = await new ProofInputBuilder(credential)
      .withUserPrivateKey(prv)
      .withTrusteePublicKey([[1n, 2n], [1n, 2n], [1n, 2n]])
      .withPolicy(policy)
      .withCircuit(circuit)
      .build()

    const data = inputs.data as any
    assert.equal(data.issuerPk.length, 2)
    assert.equal(data.issuerSignature.length, 3)
    assert.equal(data.birthDate, '19890101')
    assert.equal(data.birthDateKey, 0n)
    assert.equal(data.birthDateProof.length, 6)
    assert.deepEqual(data.trusteePublicKey, [[1n, 2n], [1n, 2n], [1n, 2n]])
  })

  it('prove', async () => {
    vi.spyOn(client.credential, 'load').mockReturnValue(Promise.resolve(credential))
    // vi.spyOn(client.circuit, 'load').mockReturnValue(Promise.resolve(circuit))
    // vi.spyOn(client.policy, 'load').mockReturnValue(Promise.resolve(policy))

    vi.spyOn(client.proofRequest, 'loadFull').mockReturnValue(Promise.resolve({
      proofRequest: { circuit: PublicKey.default, policy: PublicKey.default },
      circuit,
      policy,
      serviceProvider,
    } as any))

    const trusteeCount = 3
    const trusteePublicKeys: [bigint, bigint][] = []
    for (let i = 0; i < trusteeCount; i++) {
      const trusteeKeypair = Keypair.generate()
      const trusteePublicKey = eddsa.prv2pub(trusteeKeypair.secretKey)
      trusteePublicKeys.push(trusteePublicKey)
    }

    vi.spyOn(client.service, 'loadTrusteeKeys').mockReturnValue(Promise.resolve(trusteePublicKeys))
    vi.spyOn(client.provider, 'sendAll').mockReturnValue(Promise.resolve(['abc123']))

    const { signatures, proof, publicSignals } = await client.proofRequest.fullProve({
      // exposedFields: circuit.privateSignals,
      userPrivateKey: payerKeypair.secretKey,
      proofRequest: PublicKey.default,
      vc: PublicKey.default,
    })

    const isVerified = await Albus.zkp.verifyProof({
      vk: Albus.zkp.decodeVerifyingKey(circuit.vk),
      proof,
      // @ts-expect-error readonly
      publicInput: publicSignals,
    })

    console.log(proof)
    console.log(publicSignals)

    assert.ok(isVerified)
    assert.equal(signatures[0], 'abc123')
  })

  it('verify', async () => {
    const proof = Albus.zkp.encodeProof({
      pi_a: [
        '2013390181102474934237225984904052601084975840579903307271824986534913896045',
        '4558797724519420279226569456496440112057206950163580132097987045500495063086',
        '1',
      ],
      pi_b: [
        [
          '15786817270941041956047894236077497565569732258571173979668689527254883994538',
          '10307112607992642951099552144388551936195265424298049403364341750508383282204',
        ],
        [
          '8449017907478324550037911330698093798850083895932566640306918663148464735693',
          '11720367108862704643578666259177799405302870698288899675013318928813747281213',
        ],
        ['1', '0'],
      ],
      pi_c: [
        '18972790189415897856384410774568224381950518271664000523796110689529407499034',
        '10278232255643862173022651028820445037182397457897102849156397457843202582821',
        '1',
      ],
      protocol: 'groth16',
      curve: 'bn128',
    })
    const publicInputs = Albus.zkp.encodePublicSignals([
      '9870872389907743520480264772184617932814544222789296514909279435808204415435',
      '7063651488046742167134275333189587443680778706004252673865640694571211354187',
      '6164010886485507166761189708841969098800077052800114552222403692537854527849',
      '19958709119133418220208389221334132214556673309684943408629095277792614690244',
      '18529402859272019307499138133470125191096245301627877249354922135687498271020',
      '8978935555679638269683545090549595935575796369889182597614773431486015598866',
      '10238260208908248447105880164051408796969738239919599565538161147284470643154',
      '18945485382616442159558202556232004744963648570553779053118148286651196121863',
      '13352535325206902356535121644246416915745237105718540318476672019606381601410',
      '14081946369669743298445123873509921466235331278202961517134190496080268088619',
      '13772797050986267525220591276618333931796856119306054122759969854387138132241',
      '20913576208511164264922267660048255661075346998627948024776734748737569077450',
      '8833919640575626152392349343687240188325236803499347851327564316939465114289',
      '549156034969917335821519187995410734713163065280479366658912200301497498928',
      '9725868237351414882977954706949997842643474406585172602654871726466466747532',
      '12901315712911773249877332425426952574521618326706468425637808382908103477931',
      '20230913',
      '18',
      '100',
      '11077866633106981791340789987944870806147307639065753995447310137530607758623',
      '353086023020879629087888673454917369147465163855843886593149553676241948357',
      '495667492475991330422281750651009254772949868345543114298160384197425362394',
      '0',
      '0',
      '0',
      '0',
      '0',
      '20841523997579262969290434121704327723902935194219264790567899027938554056663',
      '20678780156819015018034618985253893352998041677807437760911245092739191906558',
      '21153906701456715004295579276500758430977318622340395655171725984189489403836',
      '15484492519285437260388749074045005694239822857741052851485555393361224949130',
      '1662767948258934355069791443487100820038153707701411290986741440889424297316',
      '10885792365768413512549137804369875890192886096824764050339743446850762666830',
      '18443998972794771015978762894530054175226445818224747958633003674888657861829',
      '8706538838365149043121267870197625713239344563453285454504122370108741354322',
      '3125938722042305256064640820346908434199259039827584871282850530839914592940',
      '18123300727908180862256333327385566694439949351015808800158793639378016508119',
      '2495439321268858870231666794271485494097392787365591328402153416743417170449',
    ])

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
})

export function loadFixture(name: string) {
  return readFileSync(`../../circuits/${name}`)
}
