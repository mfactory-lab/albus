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
import { eddsa } from '@iden3/js-crypto'
import * as Albus from '@mfactory-lab/albus-core'
import { AnchorProvider, Wallet } from '@coral-xyz/anchor'
import { Connection, Keypair, PublicKey, clusterApiUrl } from '@solana/web3.js'
import { afterEach, assert, describe, it, vi } from 'vitest'
import type { Circuit, Policy, ServiceProvider } from '../src'
import { AlbusClient } from '../src'
import { ProofInputBuilder } from '../src/utils'
import '@vitest/web-worker'

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
      'birthDateProof[6]', 'birthDateKey',
      'currentDate', 'minAge', 'maxAge',
      'credentialRoot',
      'issuerPk[2]', 'issuerSignature[3]',
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
      { index: 8, group: 0, value: 18 },
      { index: 9, group: 0, value: 100 },
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
    // console.log(inputs.data)
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
    const proof = await Albus.zkp.encodeProof({
      pi_a: [
        '14877120137072350404451562016933109912343459838696863512647181576223910049519',
        '5283016619089287284873368587226416915084846353046100197646496297327078788626',
        '1',
      ],
      pi_b: [
        [
          '13427322630132977201450473789107006492140442873689781311403220222715074968762',
          '14378795640557794552257608171871641139887786714168891220642918235299944288490',
        ],
        [
          '7766037847519377637212164665055682340698222884300983326982119911976670170040',
          '10397022106135207376432508645115021723296662067668650329666769560520191231898',
        ],
        ['1', '0'],
      ],
      pi_c: [
        '6544844402132970515282100255483321625167672181161134211119926388406743279521',
        '15108957982288472860635321822188088414260445377201485882135190894080137241925',
        '1',
      ],
      protocol: 'groth16',
      curve: 'bn128',
    })
    const publicInputs = Albus.zkp.encodePublicSignals([
      '3389657497941546973390185279054304215387223826025722652684566341821905279852',
      '3144776032721753441579347533935953825236870206403523881337101183702378619169',
      '18725001175259552492080291914403230471777074788306554092850120571305526853051',
      '3009264531042146821637816024324852139069182165716365829163807916448330876744',
      '11958206282218304757754581705946390608154057381305404191475932663052998189461',
      '16552832345961828297800664353954034346334241571036303999633629457337825928653',
      '11990852389867973821618554389097516969122768715890020265877545265781864729830',
      '8429340023121542904064627584647128083953472602497449867733648274351632997724',
      '14265763046590171117444009530162345385587554538226581562538370764666274421866',
      '11394389402360423621662396420864930996041056664987189976535689274783230006348',
      '541291649750184114754181692421501860827183639469333927243972543320738268442',
      '4713798917154821803206191278392161339359554972747765192887316159783993063869',
      '21702879519569140708865948274895913864477962780028690503796227373308463620407',
      '18835764051229976616253900454292477409991849105464563307972433004202672940433',
      '15418152363260905282672272092798720555092445004518622649458263861773750560661',
      '21041245511809871973578346950712805496817635914202145672099507977960711387541',
      '353086023020879629087888673454917369147465163855843886593149553676241948357',
      '495667492475991330422281750651009254772949868345543114298160384197425362394',
      '0',
      '0',
      '0',
      '0',
      '0',
      '20230909',
      '18',
      '100',
      '11077866633106981791340789987944870806147307639065753995447310137530607758623',
      '20841523997579262969290434121704327723902935194219264790567899027938554056663',
      '20678780156819015018034618985253893352998041677807437760911245092739191906558',
      '21153906701456715004295579276500758430977318622340395655171725984189489403836',
      '15484492519285437260388749074045005694239822857741052851485555393361224949130',
      '1662767948258934355069791443487100820038153707701411290986741440889424297316',
      '3263630635455922504365748183269925770087061746500878013475609215352015773209',
      '3467186729853389068796259263567817399900380819142308399502216371804987398934',
      '14893009881651362467243765843593590230033241044248455228927820365341119996478',
      '5618202302112815398174118128176041580031132320103534776831395436332769013897',
      '1322690608085645443122217162409972428542992581277158762689467846703898431881',
      '5831246835101001762809269261844468705907411077796589302665403329692977909843',
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
