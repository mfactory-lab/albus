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

export class Hex {
  static readonly HEX_TABLE = '0123456789abcdef'
  static textEncoder = new TextEncoder()

  static encodeLength(n: number): number {
    return n * 2
  }

  static encode(src: Uint8Array): Uint8Array {
    const dst = new Uint8Array(Hex.encodeLength(src.length))
    let j = 0
    for (let i = 0; i < src.length; i++) {
      dst[j] = Hex.HEX_TABLE[src[i]! >> 4]!.charCodeAt(0)
      dst[j + 1] = Hex.HEX_TABLE[src[i]! & 0x0F]!.charCodeAt(0)
      j += 2
    }
    return dst
  }

  static decodeString(s: string): Uint8Array {
    return Hex.decode(s)
  }

  static fromHexChar(c: number): number {
    if ('0'.charCodeAt(0) <= c && c <= '9'.charCodeAt(0)) {
      return c - '0'.charCodeAt(0)
    } else if ('a'.charCodeAt(0) <= c && c <= 'f'.charCodeAt(0)) {
      return c - 'a'.charCodeAt(0) + 10
    }
    if ('A'.charCodeAt(0) <= c && c <= 'F'.charCodeAt(0)) {
      return c - 'A'.charCodeAt(0) + 10
    }

    throw new Error(`Invalid byte char ${c}`)
  }

  private static decode(src: string): Uint8Array {
    let i = 0
    let j = 1
    const dst: number[] = []
    for (; j < src.length; j += 2) {
      const a = Hex.fromHexChar(src[j - 1]!.charCodeAt(0))
      const b = Hex.fromHexChar(src[j]!.charCodeAt(0))
      dst[i] = (a << 4) | b
      i++
    }
    if (src.length % 2 === 1) {
      throw new Error('Invalid hex string')
    }
    return Uint8Array.from(dst)
  }

  static encodeString(b: Uint8Array): string {
    return new TextDecoder().decode(Hex.encode(b))
  }
}
