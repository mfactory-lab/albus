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

/**
 * https://github.com/multiformats/multibase/blob/master/multibase.csv
 * https://github.com/multiformats/multicodec/blob/master/table.csv
 */
export class MultiBase {
  static encode(codec: number, data: Uint8Array) {
    const bytes = new Uint8Array(data.length + 2)
    bytes[0] = (codec >> 8) & 0xFF
    bytes[1] = codec & 0xFF
    bytes.set(data, 2)
    return `z${bytesToBase58(bytes)}`
  }

  static decode(data: string) {
    if (data[0] !== 'z') {
      throw new Error('invalid format, only `base58` is supported')
    }
    return base58ToBytes(data.slice(1))
  }

  /**
   * Encode public key (ed25519)
   */
  static encodePubkey(pubkey: Uint8Array) {
    return MultiBase.encode(0xED01, pubkey)
  }

  /**
   * Decode public key (ed25519)
   */
  static decodePubkey(pubkey: string) {
    const bytes = MultiBase.decode(pubkey)
    if (bytes[0] !== 0xED || bytes[1] !== 0x01) {
      throw new Error('invalid codec, only `ed25519` is supported')
    }
    return bytes.slice(2)
  }
}
