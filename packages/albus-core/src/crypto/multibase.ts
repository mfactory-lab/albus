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

import { base58ToBytes, bytesToBase58 } from './utils'

// https://github.com/multiformats/multibase/blob/master/multibase.csv
const MULTIBASE_HEADER = {
  base58btc: 'z',
}

// https://github.com/multiformats/multicodec/blob/master/table.csv
const MULTICODEC_HEADER = {
  ed25519Priv: 0x8026,
  ed25519Pub: 0xED01,
}

export class MultiBase {
  static codec = MULTICODEC_HEADER

  static encode(data: Uint8Array, codec = 0) {
    if (codec > 0) {
      const bytes = new Uint8Array(data.length + 2)
      bytes[0] = (codec >> 8) & 0xFF
      bytes[1] = codec & 0xFF
      bytes.set(data, 2)
      return `${MULTIBASE_HEADER.base58btc}${bytesToBase58(bytes)}`
    }
    return `${MULTIBASE_HEADER.base58btc}${bytesToBase58(data)}`
  }

  static decode(data: string, codec?: number) {
    if (data[0] !== MULTIBASE_HEADER.base58btc) {
      throw new Error('invalid format, only `base58` is supported')
    }
    const bytes = base58ToBytes(data.slice(1))
    if (codec) {
      if (bytes[0] !== ((codec >> 8) & 0xFF) || bytes[1] !== (codec & 0xFF)) {
        throw new Error('decoding failed, codec mismatch')
      }
      return bytes.slice(2)
    }
    return bytes
  }
}
