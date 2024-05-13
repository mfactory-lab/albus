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

import { hash } from '@stablelib/sha256'
import type { KeyPair } from '@stablelib/x25519'
import { randomBytes } from '@stablelib/random'
import { generateKeyPair, scalarMultBase, sharedKey } from '@stablelib/x25519'
import { convertPublicKeyToX25519, convertSecretKeyToX25519 } from '@stablelib/ed25519'
import { NONCE_LENGTH, TAG_LENGTH, XChaCha20Poly1305 } from '@stablelib/xchacha20poly1305'
import * as u8a from 'uint8arrays'
import { concat } from 'uint8arrays'
import {
  base58ToBytes,
  base64ToBytes,
  bytesToBase64,
  bytesToString,
  stringToBytes,
} from './utils'

export const XC20P_IV_LENGTH = NONCE_LENGTH
export const XC20P_TAG_LENGTH = TAG_LENGTH
export const XC20P_EPK_LENGTH = 32

const ECDH_ES_XC20PKW_ALG = 'ECDH-ES+XC20PKW'
const ECDH_ES_XC20PKW_KEYLEN = 256

type Envelope = {
  ciphertext: Uint8Array
  tag: Uint8Array
  iv: Uint8Array
  aad?: Uint8Array
}

// A 64-byte private key on the Ed25519 curve.
// In string form it is base58-encoded
type PublicKey = Uint8Array
type PrivateKey = Uint8Array | number[] | string

type Encrypter = (cleartext: Uint8Array, aad?: Uint8Array) => Envelope
type Decrypter = (ciphertext: Uint8Array, tag: Uint8Array, iv: Uint8Array, aad?: Uint8Array) => Uint8Array | null

export class XC20P {
  /**
   * Encrypt bytes with a {@link pubKey}
   */
  static async encryptBytes(bytes: Uint8Array, pubKey: PublicKey, esk?: PrivateKey): Promise<Uint8Array> {
    const ekp = esk ? convertSecretKeyToX25519Keypair(esk) : generateKeyPair()
    const sharedSecret = sharedKey(ekp.secretKey, convertPublicKeyToX25519(pubKey))
    const kek = concatKDF(
      sharedSecret,
      ECDH_ES_XC20PKW_KEYLEN,
      ECDH_ES_XC20PKW_ALG,
    )
    const res = xc20pEncrypter(kek)(bytes)

    return concat([
      res.iv,
      res.tag,
      res.ciphertext,
      ekp.publicKey,
    ])
  }

  /**
   * Encrypt a message with a {@link pubKey}
   */
  static async encrypt(message: string, pubKey: PublicKey, esk?: PrivateKey): Promise<string> {
    return bytesToBase64(await this.encryptBytes(stringToBytes(message), pubKey, esk))
  }

  /**
   * Decrypt an encrypted bytes with the {@link privateKey} that was used to encrypt it
   */
  static async decryptBytes(bytes: Uint8Array, privateKey: PrivateKey, epk?: Uint8Array): Promise<Uint8Array> {
    const iv = bytes.subarray(0, XC20P_IV_LENGTH)
    const tag = bytes.subarray(XC20P_IV_LENGTH, XC20P_IV_LENGTH + XC20P_TAG_LENGTH)
    const ciphertext = bytes.subarray(XC20P_IV_LENGTH + XC20P_TAG_LENGTH, -XC20P_EPK_LENGTH)
    const epkPub = epk ?? bytes.subarray(-XC20P_EPK_LENGTH)

    // normalize the key into an uint array
    const ed25519Key = makeKeypair(privateKey).secretKey

    // convert ed25519Key to x25519Key
    const curve25519Key = convertSecretKeyToX25519(ed25519Key)

    const sharedSecret = sharedKey(curve25519Key, epkPub)

    // Key Encryption Key
    const kek = concatKDF(
      sharedSecret,
      ECDH_ES_XC20PKW_KEYLEN,
      ECDH_ES_XC20PKW_ALG,
    )

    const binMessage = xc20pDecrypter(kek)(ciphertext, tag, iv)

    if (binMessage === null) {
      throw new Error('There was an error decoding the message!')
    }

    return binMessage
  }

  /**
   * Decrypt an encrypted message with the {@link privateKey} that was used to encrypt it
   */
  static async decrypt(encryptedMessage: string, privateKey: PrivateKey, epk?: Uint8Array): Promise<string> {
    return bytesToString(await this.decryptBytes(base64ToBytes(encryptedMessage), privateKey, epk))
  }
}

/**
 * Create a Solana keypair object from a x25519 private key
 * @param privateKey
 */
export function makeKeypair(privateKey: PrivateKey): KeyPair {
  let secretKey: Uint8Array
  if (Array.isArray(privateKey)) {
    secretKey = Uint8Array.from(privateKey)
  } else if (typeof privateKey === 'string') {
    secretKey = base58ToBytes(privateKey)
  } else {
    secretKey = privateKey
  }
  if (secretKey.byteLength !== 64) {
    throw new Error('bad secret key size')
  }
  const publicKey = secretKey.slice(32, 64)
  return { secretKey, publicKey }
}

function xc20pEncrypter(key: Uint8Array): Encrypter {
  const cipher = new XChaCha20Poly1305(key)
  return (cleartext: Uint8Array, aad?: Uint8Array): Envelope => {
    const iv = randomBytes(XC20P_IV_LENGTH)
    const sealed = cipher.seal(iv, cleartext, aad)
    return {
      ciphertext: sealed.subarray(0, sealed.length - XC20P_TAG_LENGTH),
      tag: sealed.subarray(sealed.length - XC20P_TAG_LENGTH),
      iv,
    }
  }
}

function xc20pDecrypter(key: Uint8Array): Decrypter {
  const cipher = new XChaCha20Poly1305(key)
  return (
    ciphertext: Uint8Array,
    tag: Uint8Array,
    iv: Uint8Array,
    aad?: Uint8Array,
  ): Uint8Array | null => cipher.open(iv, concat([ciphertext, tag]), aad)
}

function convertSecretKeyToX25519Keypair(privateKey: PrivateKey): KeyPair {
  const secretKey = convertSecretKeyToX25519(makeKeypair(privateKey).secretKey)
  const publicKey = scalarMultBase(secretKey)
  return { secretKey, publicKey }
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
  // since our key length is 256, we only have to do one round
  const roundNumber = 1
  return hash(u8a.concat([writeUint32BE(roundNumber), secret, value]))
}
