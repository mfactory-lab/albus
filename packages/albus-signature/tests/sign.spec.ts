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

import { describe, it } from 'vitest'
import vc from '@digitalcredentials/vc'
import * as didIo from '@digitalcredentials/did-io'
import { Ed25519VerificationKey2020 } from '@digitalcredentials/ed25519-verification-key-2020'
import { Ed25519Signature2020 } from '@digitalcredentials/ed25519-signature-2020'
import { securityLoader } from '@digitalcredentials/security-document-loader'
import { Keypair } from '@solana/web3.js'
import { CryptoLD } from 'crypto-ld'
import * as Albus from '@albus-finance/core'
import { BabyJubJubKey2021, BabyJubJubSignature2021Suite } from '../src'

const {
  utils: { generateDid },
  crypto: { MultiBase, poseidon, utils: { bytesToBase58, bytesToBigInt, stringToBytes } },
} = Albus

describe('vc', async () => {
  // const claims = {
  //   birthDate: '1989-01-01',
  //   firstName: 'Alex',
  //   country: 'US',
  //   alumniOf: {
  //     name: 'Example University',
  //   },
  //   degree: {
  //     type: 'BachelorDegree',
  //     name: 'Bachelor of Science and Arts',
  //     status: {
  //       value: 'ok',
  //     },
  //   },
  // }

  const keypair = Keypair.generate()

  // const signingKey = await Ed25519VerificationKey2020.from({
  //   id: '#ed25519-2020',
  //   type: 'Ed25519VerificationKey2020',
  //   controller: encodeDidKey(keypair.publicKey.toBytes()),
  //   publicKeyMultibase: MultiBase.encodePubkey(keypair.publicKey.toBytes()),
  //   // privateKeyMultibase: MultiBase.encodePubkey(keypair.secretKey),
  // })

  const privateKeyMultibase = MultiBase.encode(keypair.secretKey, MultiBase.codec.ed25519Priv)
  const publicKeyMultibase = MultiBase.encode(keypair.publicKey.toBytes(), MultiBase.codec.ed25519Pub)

  const issuerDid = 'urn:web:albus.finance' // `did:key:${publicKeyMultibase}`
  const issuerContext = generateDid(keypair, issuerDid)

  const loader = securityLoader()

  loader.setProtocolHandler({
    protocol: 'urn',
    handler: {
      async get({ url }: { url: string }) {
        const [urlAuthority, keyIdFragment] = url.split('#')
        if (issuerContext && keyIdFragment) {
          const methodId = `${urlAuthority}#${keyIdFragment}`
          const cryptoLd = new CryptoLD()
          cryptoLd.use(Ed25519VerificationKey2020 as any)
          const key = didIo.findVerificationMethod({ doc: issuerContext, methodId })
          if (!key) {
            throw new Error(`Key id ${methodId} not found.`)
          }
          const keyPair = await cryptoLd.from(key) as any
          return keyPair.export({ publicKey: true, includeContext: true })
        }
        return issuerContext
      },
    },
  })

  const documentLoader = loader.build()

  const credential = {
    '@context': [
      // 'https://www.w3.org/ns/credentials/v2',
      'https://www.w3.org/2018/credentials/v1',
      // 'https://www.w3.org/credentials/examples/v1',
      // 'https://w3id.org/security/data-integrity/v1',
      // 'https://w3id.org/openbadges/v2',
    ],
    'id': 'did:example:b34ca6cd37bbf23',
    'type': [
      'VerifiableCredential',
      // 'EmploymentAuthorizationDocumentCredential',
    ],
    // 'name': 'Employment Authorization Document',
    // 'description': 'Example Country Employment Authorization Document.',
    'issuer': 'did:key:zDnaeW9VZZs7NH1ykvS5EMFmdodu2wj4dPcrV3DzTAadrXJee',
    'issuanceDate': '2019-12-03T12:19:52Z',
    'validFrom': '2019-12-03T12:19:52Z',
    'validUntil': '2029-12-03T12:19:52Z',
    'credentialSubject': {
      id: 'did:example:123',
      // type: [
      //   'Person',
      //   'EmployablePerson',
      // ],
      // givenName: 'JOHN',
      // additionalName: 'JACOB',
      // familyName: 'SMITH',
      // image: 'data:image/png;base64,iVBORw0KGgo...kJggg==',
      // gender: 'Male',
      // residentSince: '2015-01-01',
      // birthCountry: 'Bahamas',
      // birthDate: '1958-07-17',
      // employmentAuthorizationDocument: {
      //   type: 'EmploymentAuthorizationDocument',
      //   identifier: '83627465',
      //   lprCategory: 'C09',
      //   lprNumber: '999-999-999',
      // },
    },
  }

  // 6469263406526781514240247929554311793761498877577834291513432567031201949561n
  it('bjj', async () => {
    const privateKeyBase58 = bytesToBase58(keypair.secretKey)

    const key = await BabyJubJubKey2021.from({
      controller: issuerDid,
      privateKeyBase58,
    })

    const suite = new BabyJubJubSignature2021Suite({
      key,
      // date: '2010-01-01T19:23:24Z',
    })

    const signedVC = await vc.issue({ credential, suite, documentLoader })

    console.log(signedVC)
  })

  it('ed25519', async () => {
    const suite = new Ed25519Signature2020({
      key: await Ed25519VerificationKey2020.from({
        type: 'Ed25519VerificationKey2020',
        controller: issuerDid,
        // id: `${issuerDid}#${publicKeyMultibase}`,
        publicKeyMultibase,
        privateKeyMultibase,
      }),
      // date: '2010-01-01T19:23:24Z',
    })

    //  const purpose = new CredentialIssuancePurpose()
    // const signedVC = jsigs.sign(credential, { purpose, documentLoader, suite })

    const signedVC = await vc.issue({ credential, suite, documentLoader })
    // const signedVC2 = await vc.issue({ credential: signedVC, suite, documentLoader })

    console.log(JSON.stringify(signedVC, null, 2))

    const result = await vc.verifyCredential({
      credential: signedVC,
      suite: [new Ed25519Signature2020()],
      documentLoader,
    })

    console.log(result)
  })

  it('verified', async () => {
    // const credential = {
    //   '@context': [
    //     'https://www.w3.org/2018/credentials/v1',
    //     'https://w3id.org/security/suites/ed25519-2020/v1',
    //     'https://w3id.org/dcc/v1',
    //     'https://w3id.org/vc/status-list/2021/v1',
    //   ],
    //   'type': [
    //     'VerifiableCredential',
    //     'Assertion',
    //   ],
    //   'issuer': {
    //     id: 'did:key:z6MkhVTX9BF3NGYX6cc7jWpbNnR7cAjH8LUffabZP8Qu4ysC',
    //     name: 'Example University',
    //     url: 'https://cs.example.edu',
    //     image: 'https://user-images.githubusercontent.com/947005/133544904-29d6139d-2e7b-4fe2-b6e9-7d1022bb6a45.png',
    //   },
    //   'issuanceDate': '2020-08-16T12:00:00.000+00:00',
    //   'credentialSubject': {
    //     id: 'did:key:z6MkhVTX9BF3NGYX6cc7jWpbNnR7cAjH8LUffabZP8Qu4ysC',
    //     name: 'Kayode Ezike',
    //     hasCredential: {
    //       type: [
    //         'EducationalOccupationalCredential',
    //       ],
    //       name: 'GT Guide',
    //       description: 'The holder of this credential is qualified to lead new student orientations.',
    //     },
    //   },
    //   'expirationDate': '2025-08-16T12:00:00.000+00:00',
    //   'credentialStatus': {
    //     id: 'https://digitalcredentials.github.io/credential-status-playground/JWZM3H8WKU#2',
    //     type: 'StatusList2021Entry',
    //     statusPurpose: 'revocation',
    //     statusListIndex: 2,
    //     statusListCredential: 'https://digitalcredentials.github.io/credential-status-playground/JWZM3H8WKU',
    //   },
    //   'proof': {
    //     type: 'Ed25519Signature2020',
    //     created: '2022-08-19T06:55:17Z',
    //     verificationMethod: 'did:key:z6MkhVTX9BF3NGYX6cc7jWpbNnR7cAjH8LUffabZP8Qu4ysC#z6MkhVTX9BF3NGYX6cc7jWpbNnR7cAjH8LUffabZP8Qu4ysC',
    //     proofPurpose: 'assertionMethod',
    //     proofValue: 'z4EiTbmC79r4dRaqLQZr2yxQASoMKneHVNHVaWh1xcDoPG2eTwYjKoYaku1Canb7a6Xp5fSogKJyEhkZCaqQ6Y5nw',
    //   },
    // }

    const credential = {
      '@context': [
        'https://www.w3.org/2018/credentials/v1',
        {
          AlumniCredential: 'https://example.org/examples#AlumniCredential',
          alumniOf: 'https://schema.org#alumniOf',
        },
      ],
      'id': 'https://example.edu/credentials/1872',
      'type': ['VerifiableCredential', 'AlumniCredential'],
      'issuer': 'did:key:z6MknCCLeeHBUaHu4aHSVLDCYQW9gjVJ7a63FpMvtuVMy53T',
      'credentialSubject': {
        alumniOf: 'Example University',
      },
    }

    const hash = poseidon.hash([
      bytesToBigInt(stringToBytes(credential.credentialSubject.alumniOf)),
    ])

    console.log('hash', hash)

    const _suite = new Ed25519Signature2020()

    // const result = await vc.verifyCredential({
    //   credential,
    //   suite,
    //   documentLoader,
    //   checkStatus: async () => ({ verified: true }),
    // })
    // console.log(result)
  })
})
