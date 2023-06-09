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

import { faker } from '@faker-js/faker'
import { toBigNumber } from '@metaplex-foundation/js'
import { Keypair } from '@solana/web3.js'
import log from 'loglevel'
import { useContext } from '@/context'

/**
 * Generates a credential subject with fake data.
 */
export function generateCredentialSubject() {
  const data = generateFakeSumSubData()

  return {
    givenName: data.info.firstNameEn,
    familyName: data.info.lastNameEn,
    // additionalName: '',
    // https://schema.org/GenderType
    gender: data.info.gender === 'M' ? 'male' : 'female',
    birthDate: data.info.dob,
    birthPlace: data.info.placeOfBirthEn,
    nationality: data.info.nationality,
    country: data.info.country,
    countryOfBirth: data.info.countryOfBirth,
  }
}

/**
 * SumSub Fake Data
 */
export function generateFakeSumSubData() {
  const countryCode = faker.location.countryCode('alpha-3')

  return {
    id: faker.string.alpha(32),
    createdAt: faker.date.past(),
    key: 'VVGPPFGUNZZBHF',
    clientId: 'jfactory.ch_58404',
    inspectionId: faker.string.alpha(32),
    externalUserId: `dash-${faker.string.uuid()}`,
    info: {
      firstName: faker.person.firstName(),
      firstNameEn: faker.person.firstName(),
      lastName: faker.person.lastName(),
      lastNameEn: faker.person.lastName(),
      dob: faker.date.birthdate().toISOString().substring(0, 10),
      gender: faker.person.sex() === 'male' ? 'M' : 'F',
      placeOfBirth: faker.location.city(),
      placeOfBirthEn: faker.location.city(),
      country: countryCode,
      nationality: countryCode,
      countryOfBirth: countryCode,
    },
    applicantPlatform: 'API',
    agreement: {
      createdAt: faker.date.past(),
      source: 'WebSDK',
      targets: [
        'constConsentEn_v6',
      ],
      content: null,
      link: null,
      privacyNoticeUrl: null,
    },
    requiredIdDocs: {
      docSets: [
        {
          idDocSetType: 'IDENTITY',
          types: [
            'ID_CARD',
            'PASSPORT',
            'RESIDENCE_PERMIT',
            'DRIVERS',
          ],
          subTypes: [
            'FRONT_SIDE',
            'BACK_SIDE',
          ],
        },
        {
          idDocSetType: 'SELFIE',
          types: [
            'SELFIE',
          ],
          videoRequired: 'passiveLiveness',
        },
      ],
    },
    review: {
      reviewId: 'PGRaV',
      attemptId: 'pIUYP',
      attemptCnt: 0,
      levelName: 'basic-kyc-level',
      createDate: faker.date.past(),
      reviewStatus: 'init',
      priority: 0,
    },
    lang: 'en',
    type: 'individual',
  }
}

/**
 * Mint `VerifiableCredential` NFT
 */
export async function mintVerifiableCredentialNFT(payload: { [key: string]: any }) {
  const { metaplex, config } = useContext()
  log.info('Uploading NFT metadata...')

  const name = 'ALBUS Verifiable Credential'

  const { uri: metadataUri } = await metaplex
    .nfts()
    .uploadMetadata({
      name,
      image: config.logoUrl,
      external_url: config.nftExternalUrl,
      ...payload,
    })
  log.info('Done')
  log.info(`Metadata uri: ${metadataUri}`)

  const updateAuthority = Keypair.fromSecretKey(Uint8Array.from(config.issuerSecretKey))

  log.info('Minting new NFT...')
  const { nft } = await metaplex
    .nfts()
    .create({
      uri: metadataUri,
      name,
      sellerFeeBasisPoints: 0,
      symbol: `${config.nftSymbol}-VC`,
      creators: config.nftCreators,
      isMutable: true,
      updateAuthority,
      maxSupply: toBigNumber(1),
    })

  return nft
}
