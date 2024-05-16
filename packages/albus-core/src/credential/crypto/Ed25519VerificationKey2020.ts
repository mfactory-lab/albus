import { LDKeyPair } from 'crypto-ld'
import * as ed from '@noble/ed25519'
import { base58ToBytes, base64ToBytes, bytesToBase64url } from '../../crypto/utils'
import { MultiBase } from '../../crypto'
import { Ed25519, assertKeyBytes } from './utils'

const MULTIBASE_BASE58BTC_HEADER = 'z'
const MULTICODEC_ED25519_PUB_HEADER = new Uint8Array([0xED, 0x01])
const MULTICODEC_ED25519_PRIV_HEADER = new Uint8Array([0x80, 0x26])

// @ts-expect-error override generate
export class Ed25519VerificationKey2020 extends LDKeyPair {
  static SUITE_CONTEXT = 'https://w3id.org/security/suites/ed25519-2020/v1'

  static suite = 'Ed25519VerificationKey2020'

  id?: string
  controller?: string
  revoked?: string
  type: string
  publicKeyMultibase: string
  privateKeyMultibase: string

  constructor(opts: {
    publicKeyMultibase: string
    privateKeyMultibase?: string
    type?: string
    controller?: string
    id?: string
  }) {
    super(opts)

    if (!opts.publicKeyMultibase) {
      throw new TypeError('The "publicKeyMultibase" property is required.')
    }

    if (!opts.publicKeyMultibase || !_isValidKeyHeader(opts.publicKeyMultibase, MULTICODEC_ED25519_PUB_HEADER)) {
      throw new Error(`"publicKeyMultibase" has invalid header bytes: "${opts.publicKeyMultibase}".`)
    }

    if (opts.privateKeyMultibase && !_isValidKeyHeader(opts.privateKeyMultibase, MULTICODEC_ED25519_PRIV_HEADER)) {
      throw new Error('"privateKeyMultibase" has invalid header bytes.')
    }

    // assign valid key values
    this.publicKeyMultibase = opts.publicKeyMultibase
    this.privateKeyMultibase = opts.privateKeyMultibase

    this.id = opts.id
    this.controller = opts.controller
    this.type = opts.type ?? Ed25519VerificationKey2020.suite

    // set key identifier if controller is provided
    if (this.controller && !this.id) {
      this.id = `${this.controller}#${this.fingerprint()}`
    }

    // check that the passed in keyBytes are 32 bytes
    assertKeyBytes({
      bytes: this._publicKeyBuffer,
      code: 'invalidPublicKeyLength',
      expectedLength: 32,
    })
  }

  /**
   * Creates an Ed25519 Key Pair from an existing serialized key pair.
   */
  static async from(options: any) {
    if (options.type === 'Ed25519VerificationKey2018') {
      return Ed25519VerificationKey2020.fromEd25519VerificationKey2018(options)
    }
    if (options.type === 'JsonWebKey2020') {
      return Ed25519VerificationKey2020.fromJsonWebKey2020(options)
    }
    return new Ed25519VerificationKey2020(options)
  }

  /**
   * Instance creation method for backwards compatibility with the
   * `Ed25519VerificationKey2018` key suite.
   */
  static fromEd25519VerificationKey2018({ keyPair }: { keyPair: any }) {
    const publicKeyMultibase = MultiBase.encode(base58ToBytes(keyPair.publicKeyBase58), MultiBase.codec.ed25519Pub)

    const keyPair2020 = new Ed25519VerificationKey2020({
      id: keyPair.id,
      controller: keyPair.controller,
      publicKeyMultibase,
    })

    if (keyPair.privateKeyBase58) {
      keyPair2020.privateKeyMultibase = MultiBase.encode(
        base58ToBytes(keyPair.privateKeyBase58),
        MultiBase.codec.ed25519Priv,
      )
    }

    return keyPair2020
  }

  /**
   * Creates a key pair instance (public key only) from a JsonWebKey2020 object.
   */
  static fromJsonWebKey2020({ id, type, controller, publicKeyJwk }) {
    if (type !== 'JsonWebKey2020') {
      throw new TypeError(`Invalid key type: "${type}".`)
    }

    if (!publicKeyJwk) {
      throw new TypeError('"publicKeyJwk" property is required.')
    }

    const { kty, crv } = publicKeyJwk

    if (kty !== 'OKP') {
      throw new TypeError('"kty" is required to be "OKP".')
    }

    if (crv !== 'Ed25519') {
      throw new TypeError('"crv" is required to be "Ed25519".')
    }

    const { x: publicKeyBase64Url } = publicKeyJwk
    const publicKeyMultibase = MultiBase.encode(base64ToBytes(publicKeyBase64Url), MultiBase.codec.ed25519Pub)

    return Ed25519VerificationKey2020.from({
      id, controller, publicKeyMultibase,
    })
  }

  /**
   * Generates a KeyPair with an optional deterministic seed.
   */
  static async generate({ seed, ...opts }) {
    let keypair: { publicKey: any, secretKey: any }

    if (seed) {
      ed.utils.randomPrivateKey()
      keypair = Ed25519.generateKeyPairFromSeed(seed)
    } else {
      keypair = Ed25519.generateKeyPair()
    }

    const publicKeyMultibase = MultiBase.encode(keypair.publicKey, MultiBase.codec.ed25519Pub)
    const privateKeyMultibase = MultiBase.encode(keypair.secretKey, MultiBase.codec.ed25519Priv)

    return new Ed25519VerificationKey2020({
      publicKeyMultibase,
      privateKeyMultibase,
      ...opts,
    })
  }

  /**
   * Creates an instance of Ed25519VerificationKey2020 from a key fingerprint.
   */
  static fromFingerprint({ fingerprint }) {
    return new Ed25519VerificationKey2020({ publicKeyMultibase: fingerprint })
  }

  get _publicKeyBuffer() {
    if (!this.publicKeyMultibase) {
      return
    }
    // remove multibase header
    const publicKeyMulticodec = base58ToBytes(this.publicKeyMultibase.substring(1))
    // remove multicodec header
    return publicKeyMulticodec.slice(MULTICODEC_ED25519_PUB_HEADER.length)
  }

  get _privateKeyBuffer() {
    if (!this.privateKeyMultibase) {
      return
    }
    // remove multibase header
    const privateKeyMulticodec = base58ToBytes(this.privateKeyMultibase.substring(1))
    // remove multicodec header
    return privateKeyMulticodec.slice(MULTICODEC_ED25519_PRIV_HEADER.length)
  }

  /**
   * Generates and returns a multiformats encoded
   * ed25519 public key fingerprint (for use with cryptonyms, for example).
   *
   * @see https://github.com/multiformats/multicodec
   *
   * @returns {string} The fingerprint.
   */
  fingerprint(): string {
    return this.publicKeyMultibase
  }

  /**
   * Exports the serialized representation of the KeyPair
   * and other information that JSON-LD Signatures can use to form a proof.
   */
  export({ publicKey = false, privateKey = false, includeContext = false } = {}) {
    if (!(publicKey || privateKey)) {
      throw new TypeError(
        'Export requires specifying either "publicKey" or "privateKey".')
    }
    const exportedKey: any = {
      id: this.id,
      type: this.type,
    }
    if (includeContext) {
      exportedKey['@context'] = Ed25519VerificationKey2020.SUITE_CONTEXT
    }
    if (this.controller) {
      exportedKey.controller = this.controller
    }
    if (publicKey) {
      exportedKey.publicKeyMultibase = this.publicKeyMultibase
    }
    if (privateKey) {
      exportedKey.privateKeyMultibase = this.privateKeyMultibase
    }
    if (this.revoked) {
      exportedKey.revoked = this.revoked
    }
    return exportedKey
  }

  /**
   * Returns the JWK representation of this key pair.
   */
  toJwk({ publicKey = true, privateKey = false } = {}) {
    if (!(publicKey || privateKey)) {
      throw new TypeError('Either a "publicKey" or a "privateKey" is required.')
    }
    const jwk = { crv: 'Ed25519', kty: 'OKP', x: undefined, d: undefined }
    if (publicKey) {
      jwk.x = bytesToBase64url(this._publicKeyBuffer)
    }
    if (privateKey) {
      jwk.d = bytesToBase64url(this._privateKeyBuffer)
    }
    return jwk
  }

  /**
   * @see https://datatracker.ietf.org/doc/html/rfc8037#appendix-A.3
   */
  async jwkThumbprint() {
    const publicKey = bytesToBase64url(this._publicKeyBuffer)
    const serialized = `{"crv":"Ed25519","kty":"OKP","x":"${publicKey}"}`
    const data = new TextEncoder().encode(serialized)
    return bytesToBase64url(new Uint8Array(Ed25519.sha256Digest(data)))
  }

  /**
   * Returns the JsonWebKey2020 representation of this key pair.
   */
  async toJsonWebKey2020() {
    return {
      '@context': 'https://w3id.org/security/jws/v1',
      'id': `${this.controller}#${await this.jwkThumbprint()}`,
      'type': 'JsonWebKey2020',
      'controller': this.controller,
      'publicKeyJwk': this.toJwk({ publicKey: true }),
    }
  }

  /**
   * Tests whether the fingerprint was generated from a given key pair.
   */
  verifyFingerprint({ fingerprint }: { fingerprint: string }) {
    // fingerprint should have multibase base58-btc header
    if (!(typeof fingerprint === 'string'
      && fingerprint[0] === MULTIBASE_BASE58BTC_HEADER)) {
      return {
        error: new Error('"fingerprint" must be a multibase encoded string.'),
        verified: false,
      }
    }
    let fingerprintBuffer: Uint8Array
    try {
      fingerprintBuffer = base58ToBytes(fingerprint.substring(1))
      if (!fingerprintBuffer) {
        throw new TypeError('Invalid encoding of fingerprint.')
      }
    } catch (e) {
      return { error: e, verified: false }
    }

    const buffersEqual = _isEqualBuffer(this._publicKeyBuffer, fingerprintBuffer.slice(2))

    // validate the first two multicodec bytes
    const verified
      = fingerprintBuffer[0] === MULTICODEC_ED25519_PUB_HEADER[0]
      && fingerprintBuffer[1] === MULTICODEC_ED25519_PUB_HEADER[1]
      && buffersEqual

    if (!verified) {
      return {
        error: new Error('The fingerprint does not match the public key.'),
        verified: false,
      }
    }
    return { verified }
  }

  signer() {
    const privateKeyBuffer = this._privateKeyBuffer

    return {
      async sign({ data }) {
        if (!privateKeyBuffer) {
          throw new Error('A private key is not available for signing.')
        }
        return Ed25519.sign(data, privateKeyBuffer)
      },
      id: this.id,
    }
  }

  verifier() {
    const publicKeyBuffer = this._publicKeyBuffer

    return {
      async verify({ data, signature }) {
        if (!publicKeyBuffer) {
          throw new Error('A public key is not available for verifying.')
        }
        return Ed25519.verify(signature, data, publicKeyBuffer)
      },
      id: this.id,
    }
  }
}

// check to ensure that two buffers are byte-for-byte equal
// WARNING: this function must only be used to check public information as
//          timing attacks can be used for non-constant time checks on
//          secret information.
function _isEqualBuffer(buf1: Uint8Array, buf2: Uint8Array) {
  if (buf1.length !== buf2.length) {
    return false
  }
  for (let i = 0; i < buf1.length; i++) {
    if (buf1[i] !== buf2[i]) {
      return false
    }
  }
  return true
}

// check a multibase key for an expected header
function _isValidKeyHeader(multibaseKey: string, expectedHeader: Uint8Array) {
  if (!(typeof multibaseKey === 'string'
    && multibaseKey[0] === MULTIBASE_BASE58BTC_HEADER)) {
    return false
  }

  const keyBytes = base58ToBytes(multibaseKey.slice(1))
  return expectedHeader.every((val, i) => keyBytes[i] === val)
}
