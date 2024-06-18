import base64url from 'base64url'
import { ed25519 } from '@noble/curves/ed25519'
import { sha256 } from '@noble/hashes/sha256'

export class Ed25519 {
  static generateKeyPairFromSeed(seed: Uint8Array) {
    const publicKey = ed25519.getPublicKey(seed)
    const secretKey = new Uint8Array(64)
    secretKey.set(seed)
    secretKey.set(publicKey, 32)
    return {
      publicKey,
      secretKey,
    }
  }

  static generateKeyPair() {
    return this.generateKeyPairFromSeed(ed25519.utils.randomPrivateKey())
  }

  static sign = (
    message: Parameters<typeof ed25519.sign>[0],
    secretKey: Parameters<typeof ed25519.sign>[1],
  ) => ed25519.sign(message, secretKey.slice(0, 32))

  static verify = ed25519.verify
  static sha256Digest = (msg: Uint8Array | string) => sha256(msg)
}

export function createJws({ encodedHeader, verifyData }) {
  const buffer = Buffer.concat([
    Buffer.from(`${encodedHeader}.`, 'utf8'),
    Buffer.from(verifyData.buffer, verifyData.byteOffset, verifyData.length),
  ])
  return new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.length)
}

export function decodeBase64Url(str: string) {
  const buffer = base64url.toBuffer(str)
  return new Uint8Array(buffer)
}

export function decodeBase64UrlToString(string: string) {
  return base64url.decode(string)
}

/**
 * Asserts that key bytes have a type of Uint8Array and a specific length.
 */
export function assertKeyBytes({ bytes, expectedLength = 32, code = undefined }) {
  if (!(bytes instanceof Uint8Array)) {
    throw new TypeError('"bytes" must be a Uint8Array.')
  }
  if (bytes.length !== expectedLength) {
    const error: Error & { code?: string } = new Error(`"bytes" must be a ${expectedLength}-byte Uint8Array.`)
    // we need DataError for invalid byte length
    error.name = 'DataError'
    // add the error code from the did:key spec if provided
    if (code) {
      error.code = code
    }
    throw error
  }
}
