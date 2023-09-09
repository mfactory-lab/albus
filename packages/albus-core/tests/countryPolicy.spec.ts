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

import { eddsa } from '@iden3/js-crypto'
import { Keypair } from '@solana/web3.js'
import { describe, it } from 'vitest'
import { setupCircuit } from './utils'

describe('CountryPolicy', async () => {
  const issuerKeypair = Keypair.generate()
  // const holderKeypair = Keypair.generate()

  const currentDate = 20230711
  const claims = {
    id: 0,
    birthDate: 20050711,
  }

  const issuerPk = eddsa.prv2pub(issuerKeypair.secretKey)
  // const _holderPk = edDSA.prv2pub(holderKeypair.secretKey)

  const circuit = await setupCircuit('agePolicy')

  it('valid verification', async () => {
    // ...
  })

  it('invalid verification', async () => {
    // ...
  })
})
