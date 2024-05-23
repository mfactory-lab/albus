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
import { ClaimsTree } from '../../albus-core/src/credential'
import { circomkit, prepareInput } from './common'

describe('aml', async () => {
  const issuerKeypair = Keypair.generate()

  const timestamp = 1697035401 // 2023-10-11 14:43

  // const cred = {
  //   '@context': [
  //     'https://www.w3.org/2018/credentials/v1',
  //   ],
  //   'type': ['VerifiableCredential', 'AlbusCredential', 'AMLVerification'],
  //   'issuer': 'https://example.org/issuers/123',
  //   'issuanceDate': '2023-05-19T14:30:00Z',
  //   'credentialSubject': {
  //     type: 'AMLVerification',
  //     specId: 'abc123',
  //   },
  // }

  const claims = {
    specId: '4xBXgNbECegxPRLzmTqV5eHbDwbRvkde7fxWo4Pw7vtX',
    meta: {
      validUntil: timestamp + 1,
    },
  }

  const credentialDepth = 5

  const circuit = await circomkit.WitnessTester('aml', {
    file: 'aml',
    template: 'AML',
    params: [credentialDepth],
  })

  async function generateInput(claims: Record<string, any>, params: Record<string, any> = {}) {
    return {
      ...(await prepareInput(issuerKeypair, claims, ['specId', 'meta.validUntil'])),
      expectedSpecId: ClaimsTree.encodeValue(claims.specId),
      timestamp,
      ...params,
    } as any
  }

  it('should pass if valid input', async () => {
    await circuit.expectPass(await generateInput(claims))
  })

  it('should fail if expired', async () => {
    const input = await generateInput({
      ...claims,
      meta: {
        validUntil: timestamp,
      },
    })
    await circuit.expectFail(input)
  })

  it('should fail if invalid specId', async () => {
    const input = await generateInput(claims, {
      expectedSpecId: ClaimsTree.encodeValue('test'),
    })
    await circuit.expectFail(input)
  })
})
