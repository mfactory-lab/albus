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

import type { Signer } from 'did-jwt'
import { bytesToBase64url, stringToBytes } from './utils'
import { edBabyJubJub } from './zkp'

export function EdDSAPoseidonSigner(secretKey: Uint8Array): Signer {
  const privateKeyBytes: Uint8Array = secretKey
  if (privateKeyBytes.length !== 64) {
    throw new Error(`bad_key: Invalid private key format. Expecting 64 bytes, but got ${privateKeyBytes.length}`)
  }
  return async (data: string | Uint8Array): Promise<any> => {
    const dataBytes: Uint8Array = typeof data === 'string' ? stringToBytes(data) : data
    const signature = await edBabyJubJub.signPoseidon(
      privateKeyBytes.slice(0, 32),
      dataBytes,
    )
    return bytesToBase64url(Uint8Array.from([
      ...signature.s,
      ...signature.r8[0],
      ...signature.r8[1],
    ]))
  }
}
