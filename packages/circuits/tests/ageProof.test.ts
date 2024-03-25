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
import { Keypair } from '@solana/web3.js'
import { crypto, zkp } from '@albus-finance/core'
import { generateEcdhSharedKey } from '../../albus-core/src/zkp'
import { circomkit, prepareInput } from './common'

const { eddsa } = crypto
const { formatPrivKeyForBabyJub } = zkp
const { bytesToBigInt } = crypto.utils

describe('ageProof', async () => {
  const issuerKeypair = Keypair.generate()
  const holderKeypair = Keypair.generate()
  const userPrivateKey = formatPrivKeyForBabyJub(holderKeypair.secretKey)

  const timestamp = 1697035401 // 2023-10-11 14:43

  const claims = {
    birthDate: '1966-10-02',
    meta: {
      validUntil: timestamp + 1,
    },
  }

  const credentialDepth = 5
  const shamirN = 3
  const shamirK = 2

  const circuit = await circomkit.WitnessTester('ageProof', {
    file: 'ageProof',
    template: 'AgeProof',
    params: [credentialDepth, shamirN, shamirK],
  })

  async function generateInput(claims: Record<string, any>, opts: { trustees?: Keypair[], minAge: number, maxAge?: number }) {
    const input = {
      ...(await prepareInput(issuerKeypair, claims, ['birthDate', 'meta.validUntil'])),
      timestamp,
      config: bytesToBigInt([opts.minAge, opts.maxAge ?? 0].reverse()),
      trusteePublicKey: [] as any,
      userPrivateKey,
    }

    if (opts.trustees !== undefined) {
      for (const trustee of opts.trustees) {
        const trusteePublicKey = eddsa.prv2pub(trustee.secretKey)
        input.trusteePublicKey.push(trusteePublicKey)
      }
    }

    return input as any
  }

  it('should pass if is valid age', async () => {
    const trustees = [Keypair.generate(), Keypair.generate(), Keypair.generate()]
    const input = await generateInput(claims, {
      minAge: 18,
      maxAge: 0,
      trustees,
    })

    const secret = crypto.poseidon.hash([
      input.userPrivateKey,
      input.credentialRoot,
      BigInt(input.timestamp),
    ])

    const encryptedData = crypto.poseidon.encrypt([
      input.birthDate,
    ], [secret, secret], BigInt(input.timestamp))

    const encryptedShare: any[] = []

    const holderPublicKey = eddsa.prv2pub(holderKeypair.secretKey)

    const shamirCircuit = await circomkit.WitnessTester('shamir', {
      file: 'utils/shamirSecretSharing',
      template: 'ShamirSecretSharing',
      params: [shamirN, shamirK],
    })

    const salt = crypto.poseidon.hash([userPrivateKey, input.timestamp])

    const witness = await shamirCircuit.calculateWitness({ secret, salt })
    const shares = Object.values(await shamirCircuit.readWitness(witness, [
      'main.shares[0]',
      'main.shares[1]',
      'main.shares[2]',
    ]))

    for (let i = 0; i < shamirN; i++) {
      const trustee = trustees[i]!
      const share = shares[i]!
      const sharedKey = generateEcdhSharedKey(trustee.secretKey, holderPublicKey)
      const encShare = crypto.poseidon.encrypt([share], sharedKey, BigInt(input.timestamp))
      encryptedShare.push(encShare)
    }

    await circuit.expectPass(input, {
      encryptedData,
      encryptedShare,
      userPublicKey: eddsa.prv2pub(holderKeypair.secretKey),
    })
  })

  it('should fail if age is too young', async () => {
    const input = await generateInput({ ...claims, birthDate: '2019-10-02' }, {
      minAge: 18,
    })
    await circuit.expectFail(input)
  })
})
