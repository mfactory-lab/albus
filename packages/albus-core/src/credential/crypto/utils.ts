import base64url from 'base64url'

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
 *
 * @throws {TypeError|SyntaxError} - Throws a Type or Syntax error.
 *
 * @param {object} options - Options to use.
 * @param {Uint8Array} options.bytes - The bytes being checked.
 * @param {number} [options.expectedLength] - The expected bytes' length.
 * @param {string} [options.code] - An optional code for the error.
 *
 * @returns {undefined} Returns on success throws on error.
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
