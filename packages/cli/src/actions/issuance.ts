import { faker } from '@faker-js/faker'
import { toBigNumber } from '@metaplex-foundation/js'
import log from 'loglevel'
import { useContext } from '../context'
import { encryptMessage } from '../utils/crypto'

interface Opts {}

/**
 * Issue new Verifiable Credential
 */
export async function issueVerifiableCredential(_opts: Opts) {
  const { metaplex, config, keypair } = useContext()

  const credential = generateFakeCredential('sumsub')
  const encCredential = await encryptMessage(JSON.stringify(credential), keypair.publicKey)

  const name = 'ALBUS Verifiable Credential'

  log.info('Uploading NFT metadata...')
  const { uri: metadataUri } = await metaplex
    .nfts()
    .uploadMetadata({
      name,
      verifiable_credential: encCredential,
      external_url: config.nftExternalUrl,
    })
  log.info('Done')
  log.info(`Metadata uri: ${metadataUri}`)

  log.info('Minting new NFT...')
  const { nft } = await metaplex
    .nfts()
    .create({
      uri: metadataUri,
      name,
      sellerFeeBasisPoints: 0,
      symbol: config.nftSymbol,
      creators: config.nftCreators,
      isMutable: true,
      maxSupply: toBigNumber(1),
    })

  log.info('Done')
  log.info(`Mint: ${nft.address}`)

  process.exit(0)
}

/**
 * Generate fake `VerifiableCredential` data
 */
function generateFakeCredential(issuer: 'sumsub') {
  const data = generateFakeSumSubData()

  switch (issuer) {
    case 'sumsub':
      return {
        '@context': [
          'https://www.w3.org/2018/credentials/v1',
          'https://schema.org',
        ],
        'type': ['VerifiableCredential'],
        'issuer': 'did:web:sumsub.com',
        'issuanceDate': data.createdAt,
        'credentialSubject': {
          // id: 'did:key:z6MkfxQU7dy8eKxyHpG267FV23agZQu9zmokd8BprepfHALi',
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
        },
        'proof': {
          type: 'Ed25519Signature2018',
          verificationMethod: {
            '@context': 'https://w3id.org/security/v1',
            'id': 'did:holo:b2B37C890824242Cb9B0FE5614fA2221B79901E',
            'type': 'Holochain',
          },
          created: '2021-11-05T03:12:54Z',
          proofPurpose: 'assertionMethod',
          jws: 'eyJhbGciOiJFZERTQSIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..dXNHwJ-9iPMRQ4AUcv9j-7LuImTiWAG0sDYbRRDDiyAjOV9CUmjLMKiePpytoAmGNGNTHDlEOsTa4CS3dZ7yBg',
        },
      }
  }

  throw new Error('Invalid issuer')
}

function generateFakeSumSubData() {
  const countryCode = faker.address.countryCode('alpha-3')

  return {
    id: faker.random.alpha(32),
    createdAt: faker.date.past(),
    key: 'VVGPPFGUNZZBHF',
    clientId: 'jfactory.ch_58404',
    inspectionId: faker.random.alpha(32),
    externalUserId: `dash-${faker.datatype.uuid()}`,
    info: {
      firstName: faker.name.firstName(),
      firstNameEn: faker.name.firstName(),
      lastName: faker.name.lastName(),
      lastNameEn: faker.name.lastName(),
      dob: faker.date.birthdate().toISOString().substring(0, 10),
      gender: faker.name.sex() === 'male' ? 'M' : 'F',
      placeOfBirth: faker.address.city(),
      placeOfBirthEn: faker.address.city(),
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
