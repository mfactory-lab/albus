import { encodeDidKey } from '@albus/core/src/utils'
import { faker } from '@faker-js/faker'
import { toBigNumber } from '@metaplex-foundation/js'
import type { PublicKey } from '@solana/web3.js'
import { Keypair } from '@solana/web3.js'
import { EdDSASigner } from 'did-jwt'
import type { Issuer, JwtCredentialPayload } from 'did-jwt-vc'
import { createVerifiableCredentialJwt } from 'did-jwt-vc'
import log from 'loglevel'
import { crypto } from '@albus/core'
import { useContext } from '../../context'

export interface IssueOpts {
  encrypt?: boolean
  nbf?: number
  exp?: number
}

type CredentialSubject = Record<string, any>

/**
 * Issue `VerifiableCredential`
 */
export async function issueVerifiableCredential(holder: PublicKey, opts?: IssueOpts) {
  const { config } = useContext()

  let credentialSubject = generateCredentialSubject()

  if (opts?.encrypt) {
    credentialSubject = {
      encrypted: await crypto.xc20p.encrypt(JSON.stringify(credentialSubject), holder),
    }
  }

  const signerKeypair = Keypair.fromSecretKey(Uint8Array.from(config.issuerSecretKey))
  const signer = EdDSASigner(signerKeypair.secretKey)

  const issuer: Issuer = {
    // did: 'did:web:albus.finance',
    did: encodeDidKey(signerKeypair.publicKey.toBytes()),
    signer,
    alg: 'EdDSA',
  }

  const vcPayload: JwtCredentialPayload = {
    sub: encodeDidKey(holder.toBytes()),
    aud: [config.issuerDid],
    vc: {
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      'type': ['VerifiableCredential'],
      'credentialSubject': credentialSubject,
    },
  }

  if (opts?.exp) {
    vcPayload.exp = opts.exp
  }

  if (opts?.nbf) {
    vcPayload.nbf = opts.nbf
  }

  return await createVerifiableCredentialJwt(vcPayload, issuer)
}

function generateCredentialSubject(): CredentialSubject {
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

/**
 * Mint `VerifiableCredential` NFT
 */
export async function mintVerifiableCredentialNFT(vc: string) {
  const { metaplex, config } = useContext()
  log.info('Uploading NFT metadata...')

  const name = 'ALBUS Verifiable Credential'

  const { uri: metadataUri } = await metaplex
    .nfts()
    .uploadMetadata({
      name,
      image: config.logoUrl,
      external_url: config.nftExternalUrl,
      vc,
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
