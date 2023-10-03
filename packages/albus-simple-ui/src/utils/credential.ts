/**
 * Generates a credential subject with fake data.
 */
export function generateCredentialSubject() {
  return {
    type: 'ResidentCard',
    familyName: 'Doe',
    givenName: 'John',
    gender: 'male',
    birthDate: '19840917',
    birthPlace: 'Luxembourg',
    nationality: 'FRA',
    country: 'FRA',
    countryOfBirth: 'FRA',
    personalIdentifier: '34502108',
    issuedBy: {
      name: 'SumSub',
    },
  }
}
