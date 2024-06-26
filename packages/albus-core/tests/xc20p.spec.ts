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

import { Keypair } from '@solana/web3.js'
import { assert, describe, it } from 'vitest'
import { XC20P } from '../src/crypto'
import { bigintToBytes, bytesToBigInt } from '../src/crypto/utils'

describe('xc20p', async () => {
  it('can encrypt and decrypt data', async () => {
    const user1 = Keypair.generate()
    const user2 = Keypair.generate()
    const data = 16140409637481046961916843704899482470641809764070610558947396269571678949363n
    const bytes = bigintToBytes(data)
    const encBytes = await XC20P.encryptBytes(bytes, user1.publicKey.toBytes(), user2.secretKey)
    const decBytes = await XC20P.decryptBytes(encBytes, user1.secretKey)
    assert.equal(bytesToBigInt(decBytes), data)

    const decBytes2 = await XC20P.decryptBytes(encBytes, user2.secretKey, user1.publicKey.toBytes())
    assert.equal(bytesToBigInt(decBytes2), data)
  })
})
