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

import type { PublicKey } from '@solana/web3.js'
import type { KeyPair } from '@stablelib/x25519'
import { randomBytes } from '@stablelib/random'
import { generateKeyPair, scalarMultBase, sharedKey } from '@stablelib/x25519'
import { convertPublicKeyToX25519, convertSecretKeyToX25519 } from '@stablelib/ed25519'
import { NONCE_LENGTH, TAG_LENGTH, XChaCha20Poly1305 } from '@stablelib/xchacha20poly1305'
import { concat } from 'uint8arrays'
import { Keypair } from '@solana/web3.js'
import {
  base58ToBytes,
  base64ToBytes,
  bytesToBase64,
  bytesToString,
  concatKDF,
  stringToBytes,
} from './utils'

export const XC20P_IV_LENGTH = NONCE_LENGTH
export const XC20P_TAG_LENGTH = TAG_LENGTH
export const XC20P_EPK_LENGTH = 32

// a 64-byte private key on the Ed25519 curve.
// In string form it is base58-encoded
type PrivateKey = number[] | string | Uint8Array

const ECDH_ES_XC20PKW_ALG = 'ECDH-ES+XC20PKW'
const ECDH_ES_XC20PKW_KEYLEN = 256

interface Envelope {
  ciphertext: Uint8Array
  tag: Uint8Array
  iv: Uint8Array
  aad?: Uint8Array
}

type Encrypter = (cleartext: Uint8Array, aad?: Uint8Array) => Envelope
type Decrypter = (ciphertext: Uint8Array, tag: Uint8Array, iv: Uint8Array, aad?: Uint8Array) => Uint8Array | null

export class XC20P {
  /**
   * Encrypt a message with a {@link pubKey}
   */
  static async encrypt(message: string, pubKey: PublicKey, ephemeralKey?: PrivateKey): Promise<string> {
    const epk = ephemeralKey ? convertSecretKeyToX25519Keypair(ephemeralKey) : generateKeyPair()
    const sharedSecret = sharedKey(epk.secretKey, convertPublicKeyToX25519(pubKey.toBytes()))
    const kek = concatKDF(
      sharedSecret,
      ECDH_ES_XC20PKW_KEYLEN,
      ECDH_ES_XC20PKW_ALG,
    )
    const res = xc20pEncrypter(kek)(stringToBytes(message))

    return bytesToBase64(
      concat([
        res.iv,
        res.tag,
        res.ciphertext,
        epk.publicKey,
      ]),
    )
  }

  /**
   * Decrypt an encrypted message with the {@link privateKey} that was used to encrypt it
   */
  static async decrypt(encryptedMessage: string, privateKey: PrivateKey): Promise<string> {
    const encMessage = base64ToBytes(encryptedMessage)
    const iv = encMessage.subarray(0, XC20P_IV_LENGTH)
    const tag = encMessage.subarray(XC20P_IV_LENGTH, XC20P_IV_LENGTH + XC20P_TAG_LENGTH)
    const ciphertext = encMessage.subarray(XC20P_IV_LENGTH + XC20P_TAG_LENGTH, -XC20P_EPK_LENGTH)
    const epkPub = encMessage.subarray(-XC20P_EPK_LENGTH)

    // normalise the key into an uint array
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

    return bytesToString(binMessage)
  }
}

/**
 * Create a Solana keypair object from a x25519 private key
 * @param privateKey
 */
export function makeKeypair(privateKey: PrivateKey): Keypair {
  if (Array.isArray(privateKey)) {
    return Keypair.fromSecretKey(Uint8Array.from(privateKey))
  }

  if (typeof privateKey === 'string') {
    return Keypair.fromSecretKey(base58ToBytes(privateKey))
  }

  return Keypair.fromSecretKey(privateKey)
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
