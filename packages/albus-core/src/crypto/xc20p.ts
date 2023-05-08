import { Buffer } from 'node:buffer'
import { randomBytes } from '@stablelib/random'
import { generateKeyPair, sharedKey } from '@stablelib/x25519'
import { NONCE_LENGTH, TAG_LENGTH, XChaCha20Poly1305 } from '@stablelib/xchacha20poly1305'
import * as u8a from 'uint8arrays'
import { convertPublicKey, convertSecretKey } from 'ed2curve-esm'
import type { PublicKey } from '@solana/web3.js'
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
export type PrivateKey = number[] | string | Buffer | Uint8Array

/**
 * Create a Solana keypair object from a x25519 private key
 * @param privateKey
 */
export function makeKeypair(privateKey: PrivateKey): Keypair {
  if (Array.isArray(privateKey)) {
    return Keypair.fromSecretKey(Buffer.from(privateKey))
  }

  if (typeof privateKey === 'string') {
    return Keypair.fromSecretKey(base58ToBytes(privateKey))
  }

  return Keypair.fromSecretKey(privateKey)
}

const ECDH_ES_XC20PKW_ALG = 'ECDH-ES+XC20PKW'
const ECDH_ES_XC20PKW_KEYLEN = 256

interface Envelope {
  ciphertext: Uint8Array
  tag: Uint8Array
  iv: Uint8Array
  aad?: Uint8Array
}

type Encrypter = (cleartext: Uint8Array, aad?: Uint8Array) => Envelope

type Decrypter = (
  ciphertext: Uint8Array,
  tag: Uint8Array,
  iv: Uint8Array,
  aad?: Uint8Array
) => Uint8Array | null

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
  ): Uint8Array | null => cipher.open(iv, u8a.concat([ciphertext, tag]), aad)
}

/**
 * Encrypt a message with a PublicKey
 */
export async function encrypt(message: string, pubKey: PublicKey): Promise<string> {
  const epk = generateKeyPair()
  const sharedSecret = sharedKey(epk.secretKey, convertPublicKey(pubKey.toBytes()))
  const kek = concatKDF(
    sharedSecret,
    ECDH_ES_XC20PKW_KEYLEN,
    ECDH_ES_XC20PKW_ALG,
  )
  const res = xc20pEncrypter(kek)(stringToBytes(message))

  return bytesToBase64(
    u8a.concat([
      res.iv,
      res.tag,
      res.ciphertext,
      epk.publicKey,
    ]),
  )
}

/**
 * Decrypt an encrypted message for the with the key that was used to encrypt it
 */
export async function decrypt(encryptedMessage: string, privateKey: PrivateKey): Promise<string> {
  const encMessage = base64ToBytes(encryptedMessage)
  const iv = encMessage.subarray(0, XC20P_IV_LENGTH)
  const tag = encMessage.subarray(XC20P_IV_LENGTH, XC20P_IV_LENGTH + XC20P_TAG_LENGTH)
  const ciphertext = encMessage.subarray(XC20P_IV_LENGTH + XC20P_TAG_LENGTH, -XC20P_EPK_LENGTH)
  const epkPub = encMessage.subarray(-XC20P_EPK_LENGTH)

  // normalise the key into an uint array
  const ed25519Key = makeKeypair(privateKey).secretKey
  // convert ed25519Key to x25519Key
  const curve25519Key = convertSecretKey(ed25519Key)

  const sharedSecret = sharedKey(curve25519Key, epkPub)
  // Key Encryption Key
  const kek = concatKDF(
    sharedSecret,
    ECDH_ES_XC20PKW_KEYLEN,
    ECDH_ES_XC20PKW_ALG,
  )
  const binMessage = await xc20pDecrypter(kek)(ciphertext, tag, iv)

  if (binMessage === null) {
    throw new Error('There was an error decoding the message!')
  }

  return bytesToString(binMessage)
}