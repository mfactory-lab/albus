import { crypto, zkp } from '@albus-finance/core'
import { Keypair } from '@solana/web3.js'
import { describe, it } from 'vitest'
import { countryLookup } from '../src'
import { circomkit, prepareInput } from './common'

const { eddsa } = crypto
const { formatPrivKeyForBabyJub } = zkp
const { bytesToBigInt } = crypto.utils

describe('kyc', async () => {
  const holderKeypair = Keypair.generate()
  const userPrivateKey = formatPrivKeyForBabyJub(holderKeypair.secretKey)

  const issuerKeypair = Keypair.generate()

  const timestamp = 1711154788 // 1697035401 // 2023-10-11 14:43
  const credentialDepth = 5
  const countryLookupSize = 2
  const shamirN = 3
  const shamirK = 2

  const config = {
    minAge: 18,
    maxAge: 0,
    selectionMode: 1,
    countryLookup: [
      bytesToBigInt(countryLookup(['UA', 'GB'])),
      0,
    ],
  }

  const claims = {
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
    meta: {
      validUntil: timestamp + 1,
    },
  }

  /**
   * Generate an input object for the given claims.
   *
   * @param {Record<string, any>} claims - The claims to generate the input from.
   * @return {any} The generated input object.
   */
  async function generateInput(claims: Record<string, any>) {
    const usedClaims = ['givenName', 'familyName', 'birthDate', 'country', 'docNumber', 'meta.validUntil']
    const trusteeCount = 3

    // config: 245638444340n,
    // timestamp: 1711154788,
    // birthDate: 232451328432230135312434n,

    const input = {
      ...(await prepareInput(issuerKeypair, claims, usedClaims)),
      timestamp,
      config: bytesToBigInt([config.minAge, config.maxAge, config.selectionMode].reverse()),
      countryLookup: config.countryLookup,
      trusteePublicKey: [] as any,
      userPrivateKey,
    }

    for (let i = 0; i < trusteeCount; i++) {
      const trusteeKeypair = Keypair.generate()
      const trusteePublicKey = eddsa.prv2pub(trusteeKeypair.secretKey)
      input.trusteePublicKey.push(trusteePublicKey)
    }

    return input as any
  }

  const circuit = await circomkit.WitnessTester('kyc', {
    file: 'kyc',
    template: 'Kyc',
    params: [credentialDepth, countryLookupSize, shamirN, shamirK],
  })

  it('should pass', async () => {
    const input = await generateInput(claims)

    const secret = crypto.poseidon.hash([
      input.userPrivateKey,
      input.credentialRoot,
      BigInt(input.timestamp),
    ])

    const encryptedData = crypto.poseidon.encrypt([
      input.givenName,
      input.familyName,
      input.birthDate,
      input.country,
      input.docNumber,
    ], [secret, secret], BigInt(input.timestamp))

    await circuit.expectPass(input, {
      encryptedData,
      encryptedShare: [], // TODO: check shares
      userPublicKey: eddsa.prv2pub(holderKeypair.secretKey),
    })
  })

  it('should fail if is not valid country', async () => {
    const input = await generateInput({ ...claims, country: 'DE' })
    await circuit.expectFail(input)
  })

  it('should fail if is not valid age', async () => {
    const input = await generateInput({ ...claims, birthDate: '2019-10-02' })
    await circuit.expectFail(input)
  })

  it('should fail if is expired', async () => {
    const input = await generateInput({
      ...claims,
      meta: {
        validUntil: timestamp,
      },
    })
    await circuit.expectFail(input)
  })
})
