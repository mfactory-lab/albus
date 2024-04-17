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

import * as Albus from '@albus-finance/core'
import { AnchorProvider, Wallet } from '@coral-xyz/anchor'
import { Connection, Keypair, clusterApiUrl } from '@solana/web3.js'
import { afterEach, describe, it, vi } from 'vitest'
import type { InputDescriptorV2 } from '@sphereon/pex-models'
import { AlbusClient } from '../src'

describe('credentialRequestManager', async () => {
  const issuer = Keypair.generate()
  const holder = Keypair.generate()

  const credential = await Albus.credential.createVerifiableCredential({
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

  const client = new AlbusClient(new AnchorProvider(
    new Connection(clusterApiUrl('devnet')),
    new Wallet(holder),
    AnchorProvider.defaultOptions(),
  ))

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('works', async () => {
    const def = {
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

    // const res = await client.credentialRequest.createPresentation(def, [credential], {
    //   holderSecretKey: holder.secretKey,
    // })

    // client.storage.upload(Buffer.from(res))
    // console.log(res)
  })
})
