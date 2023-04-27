import { faker } from '@faker-js/faker'
import { toBigNumber } from '@metaplex-foundation/js'
import type { PublicKey } from '@solana/web3.js'
import { Keypair } from '@solana/web3.js'
import { EdDSASigner } from 'did-jwt'
import type { Issuer, JwtCredentialPayload } from 'did-jwt-vc'
import { createVerifiableCredentialJwt } from 'did-jwt-vc'
import log from 'loglevel'
import { crypto } from '@albus/core'
import { useContext } from '../context'

interface Opts {
  provider: string
}

/**
 * Issue new Verifiable Credential
 */
export async function issueVerifiableCredential(_opts: Opts) {
  const { keypair } = useContext()

  // Issue new verifiable credentials
  const vc = await issueFakeVerifiableCredential(keypair.publicKey)

  // Encrypt verifiable credentials
  const encVc = await crypto.xc20p.encrypt(JSON.stringify(vc), keypair.publicKey)

  // Generate new VerifiableCredential-NFT
  await mintVerifiableCredentialNFT(encVc)

  process.exit(0)
}

/**
 * Mint `VerifiableCredential` NFT
 */
async function mintVerifiableCredentialNFT(vcJwt: string) {
  const { metaplex, config } = useContext()
  log.info('Uploading NFT metadata...')

  const name = 'ALBUS Verifiable Credential'

  const { uri: metadataUri } = await metaplex
    .nfts()
    .uploadMetadata({
      name,
      image: config.logoUrl,
      vc: vcJwt,
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
}

/**
 * Issue fake `VerifiableCredential`
 */
async function issueFakeVerifiableCredential(holder: PublicKey) {
  const { config } = useContext()

  // Generate fake KYC data (sumsub.com)
  const data = generateFakeSumSubData()

  const vcPayload: JwtCredentialPayload = {
    sub: `did:key:${holder.toBase58()}`,
    vc: {
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      'type': ['VerifiableCredential'],
      'credentialSubject': {
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
    },
  }

  const signerKeypair = Keypair.fromSecretKey(Uint8Array.from(config.issuerSecretKey))

  // Create a singer by using a private key.
  const signer = EdDSASigner(signerKeypair.secretKey)

  const issuer: Issuer = {
    // did: 'did:web:albus.finance',
    did: `did:key:${signerKeypair.publicKey.toBase58()}`,
    signer,
  }

  return await createVerifiableCredentialJwt(vcPayload, issuer)
}

/**
 * SumSub Fake Data
 */
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
