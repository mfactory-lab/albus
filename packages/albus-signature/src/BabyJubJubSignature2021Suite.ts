import jsigs from '@digitalcredentials/jsonld-signatures'

import { Merklizer, Path } from '@iden3/js-jsonld-merklization'
import * as Albus from '@albus-finance/core'

import base58btc from 'bs58'

import { BabyJubJubKey2021 } from './BabyJubJubKey2021'

const { utils: { w3cDate }, crypto: { utils: { base58ToBytes } } } = Albus

const {
  suites: { LinkedDataSignature },
  // purposes: { AssertionProofPurpose },
} = jsigs

const SUITE_CONTEXT_URL = ''
const MULTIBASE_BASE58BTC_HEADER = 'z'

export class BabyJubJubSignature2021Suite extends LinkedDataSignature {
  verificationKey?: string
  proofSignatureKey: string

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
      LDKeyClass: BabyJubJubKey2021,
      contextUrl: SUITE_CONTEXT_URL,
      date: options.date,
      key: options.key,
      proof: options.proof,
      signer: options.signer,
      verifier: options.verifier,
      useNativeCanonize: options.useNativeCanonize ?? false,
    })
    this.proofSignatureKey = 'proofValue'
    this.requiredKeyType = BabyJubJubKey2021.suite
  }

  ensureSuiteContext(_params: { document: any, addSuiteContext: any }) {
    // ignore
  }

  async canonize(input: Record<string, any>, { documentLoader }: any) {
    const mz = await Merklizer.merklizeJSONLD(JSON.stringify(input), { documentLoader })
    console.log('input', mz)

    const path = new Path([
      // 'https://www.w3.org/2018/credentials#issuer',
      'https://www.w3.org/2018/credentials#credentialSubject',
      'https://schema.org#alumniOf',
    ])

    // const p = await mz.resolveDocPath('credentialSubject', { documentLoader })
    // const { proof, value } = await mz.proof(p)
    //
    // console.log('proof', proof.toJSON())

    const entry = await mz.entry(path)

    const { k, v } = await entry.getKeyValueMTEntry()
    console.log({ k, v })

    const rootHash = await mz.root()

    const proof2 = await mz.mt.generateCircomVerifierProof(k, rootHash)
    // const proof2 = await mz.mt.generateProof(k, rootHash)

    console.log(proof2.value)

    return mz
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
    document: any
    proof: any
    proofSet: any
    documentLoader: any
  }) {
    const merklized = await this.canonize(document, { documentLoader })
    return (await merklized.root()).bytes
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
      [this.proofSignatureKey]: BabyJubJubSignature2021Suite.encodeProofValue(signatureBytes),
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

      if (proofValue[0] !== MULTIBASE_BASE58BTC_HEADER) {
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
    return MULTIBASE_BASE58BTC_HEADER + base58btc.encode(signatureBytes)
  }
}
