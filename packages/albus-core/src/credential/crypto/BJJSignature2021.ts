import jsigs from 'jsonld-signatures'
import { MultiBase } from '../../crypto'
import { base58ToBytes, bigintToBytes } from '../../crypto/utils'
import { w3cDate } from '../../utils'
import { ClaimsTree } from '../tree'
import { BJJVerificationKey2021 } from './BJJVerificationKey2021'

const SUITE_CONTEXT_URL = '' // TODO

/**
 * Reference: https://github.com/hypersign-protocol/BabyJubJubSignature2021Suite
 */
export class BJJSignature2021 extends jsigs.suites.LinkedDataSignature {
  requiredKeyType: string
  verificationKey?: string

  constructor(options: {
    key?: any
    signer?: any
    verifier?: any
    proof?: any
    date?: any
    useNativeCanonize?: any
    canonizeOptions?: any
  }) {
    super({
      type: 'BJJSignature2021',
      LDKeyClass: BJJVerificationKey2021,
      contextUrl: SUITE_CONTEXT_URL,
      date: options.date,
      key: options.key,
      proof: options.proof,
      signer: options.signer,
      verifier: options.verifier,
      useNativeCanonize: options.useNativeCanonize ?? false,
    })
    this.requiredKeyType = BJJVerificationKey2021.suite
  }

  ensureSuiteContext(_params: { document: any, addSuiteContext: any }) {
    // ignore
  }

  async canonize(document: Record<string, any>, opts: any) {
    return await ClaimsTree.from(document, {
      depth: opts.depth,
    })
  }

  async createProof({ document, documentLoader, proofSet, purpose, date }: {
    document: any
    purpose: any
    proofSet: any
    documentLoader: any
    readonly date?: string | Date
  }) {
    let proof: Record<string, any> = { type: this.type }
    proof.created = w3cDate(date)
    proof.verificationMethod = this.key.id

    proof = await purpose.update(proof, { document, documentLoader, suite: this })

    // create data to sign
    const verifyData = await this.createVerifyData({ document, proof, proofSet, documentLoader })

    proof = await this.sign({ verifyData, proof })

    return proof
  }

  async createVerifyData({ document, documentLoader }: {
    proof?: any
    proofSet?: any
    document: any
    documentLoader: any
  }) {
    const merklized = await this.canonize(document, { documentLoader })
    return bigintToBytes(merklized.root)
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

    // await this.assertVerificationMethod({ verificationMethod })

    return verificationMethod
  }

  async sign({ verifyData, proof }: { verifyData: Uint8Array, proof: any }) {
    if (!(this.signer && typeof this.signer.sign === 'function')) {
      throw new Error('A signer API has not been specified.')
    }
    const signatureBytes = await this.signer.sign({ data: verifyData })
    return {
      ...proof,
      proofValue: BJJSignature2021.encodeProofValue(signatureBytes),
    }
  }

  async verifyProof({ document, documentLoader, proof, proofSet }: {
    document: any
    proof: any
    proofSet?: any
    documentLoader?: any
  }) {
    try {
      const { proofValue } = proof

      if (proofValue[0] !== 'z') {
        throw new Error('Only base58btc multibase encoding is supported.')
      }

      const verifyData = await this.createVerifyData({ document, documentLoader, proof, proofSet })

      const verified = await this.verifySignature({
        signature: base58ToBytes(proofValue.substring(1)),
        verifyData,
      })

      if (!verified) {
        throw new Error('Invalid signature.')
      }

      // const verificationMethod = await this.getVerificationMethod({ proof, documentLoader })

      return {
        verified,
        verificationMethod: {
          id: proof.verificationMethod,
          controller: this.key.controller,
          publicKeyBase58: this.key.publicKeyBase58,
          type: this.key.type,
        },
      }
    } catch (error: any) {
      return { verified: false, error }
    }
  }

  async verifySignature(options: { verifyData: Uint8Array, signature: Uint8Array }) {
    let { verifier } = this
    if (!verifier) {
      const key = await this.LDKeyClass.from(this.verificationMethod)
      verifier = key.verifier()
    }
    return verifier.verify({
      data: options.verifyData,
      signature: options.signature,
    })
  }

  static encodeProofValue(signatureBytes: number[] | Uint8Array) {
    return MultiBase.encode(Uint8Array.from(signatureBytes))
  }
}
