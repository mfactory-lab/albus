import jsigs from 'jsonld-signatures'
import base58btc from 'bs58'
import base64url from 'base64url'
import type KeyObject from 'jsonld-signatures/KeyObject'
import { createJws, decodeBase64Url, decodeBase64UrlToString } from './utils'

const MULTIBASE_BASE58BTC_HEADER = 'z'

export default class CustomLinkedDataSignature extends jsigs.suites.LinkedDataSignature {
  alg: string
  useProofValue: boolean

  constructor(opts: {
    alg?: any
    useProofValue?: any
    type: string
    proof?: any
    LDKeyClass: any
    date?: any
    key?: KeyObject
    signer?: any
    verifier?: any
    useNativeCanonize?: boolean
    canonizeOptions?: any
    contextUrl: string
  }) {
    super(opts)
    this.alg = opts.alg
    this.useProofValue = opts.useProofValue ?? false
  }

  /**
   * Verifies the proof signature against the given data.
   *
   * @param {object} options - The options to use.
   * @param {Uint8Array} options.verifyData - Canonical hashed data.
   * @param {object} options.verificationMethod - Key object.
   * @param {object} options.proof - The proof to be verified.
   *
   * @returns {Promise<boolean>} Resolves with the verification result.
   */
  async verifySignature({ verifyData, verificationMethod, proof }: {
    verifyData: Uint8Array
    verificationMethod: KeyObject
    proof: any
  }): Promise<boolean> {
    let signatureBytes: Uint8Array
    let data = verifyData

    const { proofValue, jws } = proof
    if (proofValue && typeof proofValue === 'string') {
      signatureBytes = base58btc.decode(CustomLinkedDataSignature.fromJsigProofValue(proofValue))
    } else if (jws && typeof jws === 'string') {
      // Fallback to older jsonld-signature implementations
      const [encodedHeader, /* payload */, encodedSignature] = jws.split('.')
      let header: any

      try {
        header = JSON.parse(decodeBase64UrlToString(encodedHeader))
      } catch (e) {
        throw new Error(`Could not parse JWS header; ${e}`)
      }
      if (!(header && typeof header === 'object')) {
        throw new Error('Invalid JWS header.')
      }

      signatureBytes = decodeBase64Url(encodedSignature)
      data = createJws({ encodedHeader, verifyData })
    }

    let { verifier } = this
    if (!verifier) {
      const key = await this.LDKeyClass.from(verificationMethod)
      verifier = key.verifier()
    }

    return verifier.verify({ data, signature: signatureBytes })
  }

  /**
   * Adds a signature (proofValue) field to the proof object. Called by
   * LinkedDataSignature.createProof().
   *
   * @param {object} options - The options to use.
   * @param {Uint8Array} options.verifyData - Data to be signed (extracted from a document, according to the suite's spec).
   * @param {object} options.proof - Proof object (containing the proofPurpose, verificationMethod, etc.).
   *
   * @returns {Promise<object>} Resolves with the proof containing the signature value.
   */
  async sign({ verifyData, proof }: { verifyData: Uint8Array, proof: any }): Promise<object> {
    if (!(this.signer && typeof this.signer.sign === 'function')) {
      throw new Error('A signer API has not been specified.')
    }

    const getSigBytes = async (data: string | Uint8Array) => {
      let signatureBytes: Uint8Array

      const signature = await this.signer.sign({ data })
      if (typeof signature === 'string') {
        // Some signers will return a string like: header.signature
        // split apart those strings to get the signature in bytes
        const signatureSplit = signature.split('.')
        const signatureEncoded = signatureSplit[signatureSplit.length - 1]
        signatureBytes = decodeBase64Url(signatureEncoded)
      } else {
        signatureBytes = signature
      }
      return signatureBytes
    }

    const finalProof = { ...proof }

    if (this.useProofValue) {
      const signatureBytes = await getSigBytes(verifyData)
      finalProof.proofValue = CustomLinkedDataSignature.encodeProofValue(signatureBytes)
    } else {
      if (!this.alg) {
        throw new Error('Suite doesn\'t contain required alg parameter')
      }

      const header = { alg: this.alg, b64: false, crit: ['b64'] }
      const encodedHeader = base64url.encode(JSON.stringify(header))
      const jwsData = createJws({ encodedHeader, verifyData })
      const signatureBytesJWS = await getSigBytes(jwsData)

      finalProof.jws = `${encodedHeader}..${base64url.encode(Buffer.from(signatureBytesJWS))}`
    }

    return finalProof
  }

  static encodeProofValue(signatureBytes: Uint8Array) {
    return MULTIBASE_BASE58BTC_HEADER + base58btc.encode(signatureBytes)
  }

  /**
   * Json-ld signs prefix signatures with a specific character.
   * Removes that character
   */
  static fromJsigProofValue(proofValue: string): string {
    if (proofValue[0] !== MULTIBASE_BASE58BTC_HEADER) {
      throw new Error('Only base58btc multibase encoding is supported.')
    }
    return proofValue.substring(1)
  }
}
