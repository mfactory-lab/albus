import { faker } from '@faker-js/faker'

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
