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
import type { InputDescriptorV2 } from '@sphereon/pex-models'
import { PEX } from '@sphereon/pex'
import { Keypair } from '@solana/web3.js'
import { credential } from '@albus-finance/core'

describe('pex', () => {
  it('works', async () => {
    const pex = new PEX()

    // Example of Presentation Definition V2
    const presentationDefinitionV2 = {
      id: '1',
      input_descriptors: [
        {
          id: 'albus_id_card',
          name: 'Albus ID Card',
          purpose: 'To verify Albus credentials',
          constraints: {
            fields: [
              {
                path: ['$.issuer'],
                filter: {
                  type: 'string',
                  const: 'did:web:albus.finance',
                },
              },
            ],
          },
        },
      ] as InputDescriptorV2[],
    }

    const issuer = Keypair.generate()

    const cred = await credential.createVerifiableCredential({
      givenName: 'Mikayla',
      familyName: 'Halvorson',
      gender: 'female',
      birthDate: '1966-10-02',
      birthPlace: 'Westland',
      nationality: 'GB',
      country: 'GB',
      countryOfBirth: 'GB',
      docType: 'ID_CARD',
      docNumber: 'AB123456',
    }, {
      issuerSecretKey: issuer.secretKey,
    })

    console.log(cred)

    // const credential = {
    //   '@context': ['https://www.w3.org/ns/credentials/v2'],
    //   'type': ['VerifiableCredential', 'AlbusCredentialV2'],
    //   'issuer': 'did:web:albus.finance',
    //   'issuanceDate': '2024-03-27T17:35:52.540Z',
    //   'credentialSubject': {
    //     givenName: 'Mikayla',
    //     familyName: 'Halvorson',
    //     gender: 'female',
    //     birthDate: '1966-10-02',
    //     birthPlace: 'Westland',
    //     nationality: 'GB',
    //     country: 'GB',
    //     countryOfBirth: 'GB',
    //     docType: 'ID_CARD',
    //     docNumber: 'AB123456',
    //   },
    //   'proof': [
    //     {
    //       type: 'BabyJubJubSignature2021',
    //       created: '1711560952634',
    //       verificationMethod: '#eddsa-bjj',
    //       credentialHash: '5116274216029599390514665569961009758379091985978787472785746168558961665331',
    //       proofValue: 'abc',
    //       proofPurpose: 'assertionMethod',
    //     },
    //   ],
    // }

    const cred2 = { ...cred, issuer: 'did:web:albus.finance2' }

    const verifiablePresentation = {
      '@context': [
        'https://www.w3.org/2018/credentials/v1',
        'https://identity.foundation/presentation-exchange/submission/v1',
      ],
      'type': [
        'VerifiablePresentation',
        'PresentationSubmission',
      ],
      // 'presentation_submission': {},
      'verifiableCredential': [cred, cred2],
      // 'proof': {},
    }

    // const res = pex.verifiablePresentationFrom(
    //   presentationDefinitionV2,
    //   [credential, credential2],
    // )

    const res = pex.evaluatePresentation(presentationDefinitionV2, verifiablePresentation)
    console.log(res)
  })
})
