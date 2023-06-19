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

/**
 * Left pads byte array to length
 *
 * @param byteArray - byte array to pad
 * @param length - length of new array
 * @returns padded array
 */
import { hash } from '@stablelib/sha256'
import * as u8a from 'uint8arrays'

export function arrayToByteLength(byteArray: Uint8Array, length: number) {
  // Check the length of array requested is large enough to accommodate the original array
  if (byteArray.length > length) {
    throw new Error('BigInt byte size is larger than length')
  }

  // Create Uint8Array of requested length
  return new Uint8Array(new Array(length - byteArray.length).concat(...byteArray))
}

/**
 * Convert typed byte array to bigint
 *
 * @param array - Array to convert
 * @returns bigint
 */
export function arrayToBigInt(array: Uint8Array): bigint {
  // Initialize result as 0
  let result = 0n

  // Loop through each element in the array
  array.forEach((element) => {
    // Shift result bits left by 1 byte
    result = result << 8n

    // Add element to result, filling the last bit positions
    result += BigInt(element)
  })
  return result
}

/**
 * Convert bigint to byte array
 *
 * @param bn - bigint
 * @param length - length of resulting byte array, 0 to return byte length of integer
 * @returns byte array
 */
export function bigIntToArray(bn: bigint, length: number): Uint8Array {
  // Convert bigint to hex string
  let hex = BigInt(bn).toString(16)

  // If hex is odd length then add leading zero
  if (hex.length % 2) {
    hex = `0${hex}`
  }

  // Split into groups of 2 to create hex array
  const hexArray = hex.match(/.{2}/g) ?? []

  // Convert hex array to uint8 byte array
  const byteArray = new Uint8Array(hexArray.map(byte => Number.parseInt(byte, 16)))

  return arrayToByteLength(byteArray, length)
}

/**
 * Convert byte array to hex string
 *
 * @param array - byte array
 * @param prefix - prefix with 0x
 * @returns hex string
 */
export function arrayToHexString(array: Uint8Array, prefix?: boolean) {
  // Create empty hex string
  let hexString = ''

  // Loop through each byte of array
  array.forEach((byte) => {
    // Convert integer representation to base 16
    let hexByte = byte.toString(16)

    // Ensure 2 chars
    hexByte = hexByte.length === 1 ? `0${hexByte}` : hexByte

    // Append to hexString
    hexString += hexByte
  })

  // Prefix if needed
  return prefix ? `0x${hexString}` : hexString
}

/**
 * Convert hex string to byte array
 *
 * @param hexString - hex string
 * @returns byte array
 */
export function hexStringToArray(hexString: string) {
  // Strip leading 0x if present
  const hexStringFormatted = hexString.startsWith('0x') ? hexString.slice(2) : hexString

  // Create empty array
  const array = new Uint8Array(hexStringFormatted.length / 2)

  // Fetch matching byte index from hex string and parse to integer
  array.map(
    (element, index) =>
      (array[index] = Number.parseInt(hexStringFormatted.substring(index * 2, index * 2 + 2), 16)),
  )

  return array
}

/**
 * Split bytes into array of chunks
 *
 * @param data - data to chunk
 * @param size - size of chunks
 * @returns chunked data
 */
export function chunk(data: Uint8Array, size: number): Uint8Array[] {
  // Define chunks array
  const chunks: Uint8Array[] = []

  // Loop through data array
  for (let i = 0; i < data.length; i += size) {
    // Slice chunk
    chunks.push(data.slice(i, i + size))
  }

  return chunks
}

/**
 * Combines Uint8Array chunks
 *
 * @param chunks - chunks to combine
 * @returns combined data
 */
export function combine(chunks: Uint8Array[]): Uint8Array {
  return chunks.reduce((left, right) => new Uint8Array([...left, ...right]))
}

/**
 * Pads bytes to length
 *
 * @param data - bytes to pad
 * @param length - length to pad to
 * @param side - side to add padding
 * @returns padded data
 */
export function padToLength(data: Uint8Array, length: number, side: 'left' | 'right'): Uint8Array {
  // Calculate amount of padding needed
  const slack = length - data.length

  if (side === 'left') {
    // If padding is on left side, create new Uint8Array with 0 filled left
    return new Uint8Array([...new Uint8Array(slack), ...data])
  } else {
    // If padding is on right side, create new Uint8Array with 0 filled right
    return new Uint8Array([...data, ...new Uint8Array(slack)])
  }
}

/**
 * Converts utf8 bytes to string
 *
 * @param data - bytes to decode
 * @returns decoded string
 */
export function toUTF8String(data: Uint8Array): string {
  return new TextDecoder().decode(data)
}

/**
 * Converts string to bytes
 *
 * @param string - string to convert to bytes
 * @returns encoded bytes
 */
export function fromUTF8String(string: string): Uint8Array {
  return new TextEncoder().encode(string)
}

function writeUint32BE(value: number, array = new Uint8Array(4)): Uint8Array {
  const encoded = u8a.fromString(value.toString(), 'base10')
  array.set(encoded, 4 - encoded.length)
  return array
}

function lengthAndInput(input: Uint8Array): Uint8Array {
  return u8a.concat([writeUint32BE(input.length), input])
}

/**
 * Implementation from:
 * https://github.com/decentralized-identity/did-jwt
 */
export function concatKDF(
  secret: Uint8Array,
  keyLen: number,
  alg: string,
): Uint8Array {
  if (keyLen !== 256) {
    throw new Error(`Unsupported key length: ${keyLen}`)
  }
  const value = u8a.concat([
    lengthAndInput(u8a.fromString(alg)),
    lengthAndInput(new Uint8Array(0)), // apu
    lengthAndInput(new Uint8Array(0)), // apv
    writeUint32BE(keyLen),
  ])
  // since our key length is 256 we only have to do one round
  const roundNumber = 1
  return hash(u8a.concat([writeUint32BE(roundNumber), secret, value]))
}

export function base64ToBytes(s: string): Uint8Array {
  return u8a.fromString(s, 'base64pad')
}

export function bytesToBase64(b: Uint8Array): string {
  return u8a.toString(b, 'base64pad')
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
