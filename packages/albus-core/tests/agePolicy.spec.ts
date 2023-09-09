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
import { babyJub, eddsa } from '@iden3/js-crypto'
import { assert, describe, it } from 'vitest'
import { createClaimsTree } from '../src/credential'
import { poseidonDecrypt, reconstructShamirSecret } from '../src/crypto'
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

  it('poseidonDecrypt', async () => {
    const encData = [
      '3492256907623638915689586474801812198395017384415567085378861909185165398097',
      '12394761557417503556986200237947612068807125837264760317749764602613090659674',
      '1130867009931226106191543978960732037526128032541504427931914881399654214948',
      '15572539609619963723450936353267031363425395278411889980469904474360306402314',
    ]
    const secret = '186558642041440299711362618815710781931'
    const nonce = 20230711
    const data = poseidonDecrypt(encData.map(BigInt), [secret, secret].map(BigInt), 1, BigInt(nonce))
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

    // reconstruct secret key

    let i = 4
    const shares: any[] = []
    for (const sharedKey of sharedKeys) {
      const share = poseidonDecrypt([
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

    const decryptedData = poseidonDecrypt([
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

// input {
//   birthDate: '20050711',
//     birthDateProof: [
//     '353086023020879629087888673454917369147465163855843886593149553676241948357',
//     '495667492475991330422281750651009254772949868345543114298160384197425362394',
//     0,
//     0,
//     0,
//     0
//   ],
//     birthDateKey: 0,
//     currentDate: 20230711,
//     minAge: 18,
//     maxAge: 100,
//     credentialRoot: '16505959073956531595133108421534061858000833967525307115815102682423494538719',
//     issuerPk: [
//     '18665960590631801763761327789566360800091858585369462650518748107479190018597',
//     '5107508176595681305935166552890868835087726105372368515893376091772833964976'
//   ],
//     issuerSignature: [
//     '4701158515303852681182557973024558254170752876040438107904660089985806000719',
//     '7323972223540047164503587013093073799485078740419449717650033086104666962763',
//     '233929091230252925063868831971332309691914455773141895179510305792505460383'
//   ],
//     secret: 186558642041440299711362618815710781931n,
//     userPrivateKey: 4248227829172586092452296147066230287421059669084072829029154642950413866050n,
//     trusteePublicKey: [
//     [
//       '6850013365407545145357047083653360791115770592125409592674710636142688824390',
//       '19924360132063684302860268437692251571421310850997078220693117390947735362532'
//     ],
//     [
//       '13039224029874091554330328121547441310410269231902889851387644674915546465705',
//       '12616789153138571535326414054956905942655090596786694713145667272600835765247'
//     ],
//     [
//       '14582075724073512540490095195640891024555037131866529385485975663122502946547',
//       '8821003152387002573303121994987858780004107922222130043706125494696160837580'
//     ]
//   ]
// }

// publicSignals [
//   '3492256907623638915689586474801812198395017384415567085378861909185165398097',
//     '12394761557417503556986200237947612068807125837264760317749764602613090659674',
//     '1130867009931226106191543978960732037526128032541504427931914881399654214948',
//     '15572539609619963723450936353267031363425395278411889980469904474360306402314',
//     '9659786197456987821619853870804272523233452332855654912592413321362860841990',
//     '15730629527684806318553547404816562634744678689386416840404643314642965688415',
//     '495353670746762246979863113508896515998919130266209747675103977614420186674',
//     '15267520757315191577246783817434161559523829560047142300368818418651901579688',
//     '21358719970367892585351490140247808423598694760962583102316231670053513271461',
//     '15257198551772205352852516761461279864969618273141512960974820292651348278186',
//     '7350491050950659340209616106952204190638038804418168648585059877329462227652',
//     '11197271101553087580480192892382820469756853529818524131507875471296690526181',
//     '12163301298236087897490464305804731021039437747154347364336482348035664325720',
//     '5440444696288216952800453150709939187784262304829697034277131494661688587121',
//     '10863171692251691743555560134119800264618395223947442290151352074621090740251',
//     '12698767049504827474331921437480531121352677588791100999550779130210970280759',
//     '353086023020879629087888673454917369147465163855843886593149553676241948357',
//     '495667492475991330422281750651009254772949868345543114298160384197425362394',
//     '0',
//     '0',
//     '0',
//     '0',
//     '0',
//     '20230711',
//     '18',
//     '100',
//     '16505959073956531595133108421534061858000833967525307115815102682423494538719',
//     '18665960590631801763761327789566360800091858585369462650518748107479190018597',
//     '5107508176595681305935166552890868835087726105372368515893376091772833964976',
//     '4701158515303852681182557973024558254170752876040438107904660089985806000719',
//     '7323972223540047164503587013093073799485078740419449717650033086104666962763',
//     '233929091230252925063868831971332309691914455773141895179510305792505460383',
//     '6850013365407545145357047083653360791115770592125409592674710636142688824390',
//     '19924360132063684302860268437692251571421310850997078220693117390947735362532',
//     '13039224029874091554330328121547441310410269231902889851387644674915546465705',
//     '12616789153138571535326414054956905942655090596786694713145667272600835765247',
//     '14582075724073512540490095195640891024555037131866529385485975663122502946547',
//     '8821003152387002573303121994987858780004107922222130043706125494696160837580'
//   ]
