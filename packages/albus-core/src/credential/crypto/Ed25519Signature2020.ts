import jsigs from 'jsonld-signatures'
import { base58ToBytes, bytesToBase58 } from '../../crypto/utils'
import { Ed25519VerificationKey2020 } from './Ed25519VerificationKey2020'

const SUITE_CONTEXT_URL = 'https://w3id.org/security/suites/ed25519-2020/v1'
const SUITE_CONTEXT_URL_2018 = 'https://w3id.org/security/suites/ed25519-2018/v1'
const MULTIBASE_BASE58BTC_HEADER = 'z'

const {
  suites: { LinkedDataSignature },
} = jsigs

export class Ed25519Signature2020 extends LinkedDataSignature {
  static CONTEXT_URL = SUITE_CONTEXT_URL

  requiredKeyType: string

  constructor(opts: {
    key?: any
    signer?: any
    verifier?: any
    proof?: any
    date?: any
    useNativeCanonize?: any
    canonizeOptions?: any
  } = {}) {
    super({
      type: 'Ed25519Signature2020',
      LDKeyClass: Ed25519VerificationKey2020,
      contextUrl: SUITE_CONTEXT_URL,
      ...opts,
    })
    this.requiredKeyType = 'Ed25519VerificationKey2020'
  }

  async sign({ verifyData, proof }) {
    if (!(this.signer && typeof this.signer.sign === 'function')) {
      throw new Error('A signer API has not been specified.')
    }
    const signatureBytes = await this.signer.sign({ data: verifyData })
    proof.proofValue = MULTIBASE_BASE58BTC_HEADER + bytesToBase58(signatureBytes)
    return proof
  }

  /**
   * Verifies the proof signature against the given data.
   */
  async verifySignature({ verifyData, verificationMethod, proof }) {
    const { proofValue } = proof
    if (!(proofValue && typeof proofValue === 'string')) {
      throw new TypeError(
        'The proof does not include a valid "proofValue" property.')
    }
    if (proofValue[0] !== MULTIBASE_BASE58BTC_HEADER) {
      throw new Error('Only base58btc multibase encoding is supported.')
    }
    const signatureBytes = base58ToBytes(proofValue.substring(1))

    let { verifier } = this
    if (!verifier) {
      const key = await this.LDKeyClass.from(verificationMethod)
      verifier = key.verifier()
    }
    return verifier.verify({ data: verifyData, signature: signatureBytes })
  }

  async assertVerificationMethod({ verificationMethod }) {
    let contextUrl: string

    if (verificationMethod.type === 'Ed25519VerificationKey2020') {
      contextUrl = SUITE_CONTEXT_URL
    } else if (verificationMethod.type === 'Ed25519VerificationKey2018') {
      contextUrl = SUITE_CONTEXT_URL_2018
    } else {
      throw new Error(`Unsupported key type "${verificationMethod.type}".`)
    }

    if (!_includesContext({
      document: verificationMethod, contextUrl,
    })) {
      throw new TypeError(
        `The verification method (key) must contain "${contextUrl}" context.`,
      )
    }

    if (verificationMethod.revoked !== undefined) {
      throw new Error('The verification method has been revoked.')
    }
  }

  async getVerificationMethod({ proof, documentLoader }) {
    if (this.key) {
      // This happens most often during sign() operations. For verify(),
      // the expectation is that the verification method will be fetched
      // by the documentLoader (below), not provided as a `key` parameter.
      return this.key.export({ publicKey: true })
    }

    let { verificationMethod } = proof

    if (typeof verificationMethod === 'object') {
      verificationMethod = verificationMethod.id
    }

    if (!verificationMethod) {
      throw new Error('No "verificationMethod" found in proof.')
    }

    const { document } = await documentLoader(verificationMethod)

    verificationMethod = typeof document === 'string'
      ? JSON.parse(document)
      : document

    await this.assertVerificationMethod({ verificationMethod })

    if (verificationMethod.type === 'Ed25519VerificationKey2018') {
      verificationMethod = (Ed25519VerificationKey2020
        .fromEd25519VerificationKey2018({ keyPair: verificationMethod }))
        .export({ publicKey: true, includeContext: true })
    }

    return verificationMethod
  }

  async updateProof({ proof }) {
    console.log(this.key)
    // extending classes may do more
    return proof
  }

  async matchProof({ proof, document, purpose, documentLoader, expansionMap }) {
    if (!_includesContext({ document, contextUrl: SUITE_CONTEXT_URL })) {
      return false
    }

    if (!await super.matchProof({ proof, document, purpose, documentLoader, expansionMap })) {
      return false
    }

    if (!this.key) {
      // no key specified, so assume this suite matches and it can be retrieved
      return true
    }

    const { verificationMethod } = proof

    // only match if the key specified matches the one in the proof
    if (typeof verificationMethod === 'object') {
      return verificationMethod.id === this.key.id
    }
    return verificationMethod === this.key.id
  }
}

/**
 * Tests whether a provided JSON-LD document includes a context url in its
 * `@context` property.
 */
function _includesContext({ document, contextUrl }): boolean {
  const context = document['@context']
  return context === contextUrl
    || (Array.isArray(context) && context.includes(contextUrl))
}
