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

import * as u8a from 'uint8arrays'

export function hexToBytes(s: string, minLength?: number): Uint8Array {
  let input = s.startsWith('0x') ? s.substring(2) : s

  if (input.length % 2 !== 0) {
    input = `0${input}`
  }

  if (minLength) {
    const paddedLength = Math.max(input.length, minLength * 2)
    input = input.padStart(paddedLength, '00')
  }

  return u8a.fromString(input.toLowerCase(), 'base16')
}

export function bytesToHex(b: Uint8Array): string {
  return u8a.toString(b, 'base16')
}

export function bytesToBigInt(b: ArrayLike<number>): bigint {
  return BigInt(`0x${u8a.toString(Uint8Array.from(b), 'base16')}`)
}

export function bigintToBytes(n: bigint, minLength?: number): Uint8Array {
  return hexToBytes(n.toString(16), minLength)
}

export function base64ToBytes(s: string): Uint8Array {
  return u8a.fromString(s, 'base64pad')
}

export function bytesToBase64(b: Uint8Array): string {
  return u8a.toString(b, 'base64pad')
}

export function base64urlToBytes(s: string): Uint8Array {
  return u8a.fromString(s, 'base64url')
}

export function bytesToBase64url(b: Uint8Array): string {
  return u8a.toString(b, 'base64url')
}

export function stringToBytes(s: string): Uint8Array {
  return u8a.fromString(s)
}

export function bytesToString(s: Uint8Array): string {
  return u8a.toString(s)
}

export function base58ToBytes(s: string): Uint8Array {
  return u8a.fromString(s, 'base58btc')
}

export function bytesToBase58(b: Uint8Array): string {
  return u8a.toString(b, 'base58btc')
}
