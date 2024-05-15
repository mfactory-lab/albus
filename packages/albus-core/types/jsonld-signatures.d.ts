declare module 'types/jsonld-signatures' {

  import type LinkedDataSignature from 'jsonld-signatures/suites/LinkedDataSignature'
  import type AuthenticationProofPurpose from 'jsonld-signatures/purposes/AuthenticationProofPurpose'
  import type AssertionProofPurpose from 'jsonld-signatures/purposes/AssertionProofPurpose'
  import type ControllerProofPurpose from 'jsonld-signatures/purposes/ControllerProofPurpose'
  import type ProofPurpose from 'jsonld-signatures/purposes/ProofPurpose'
  import type VerificationError from 'jsonld-signatures/VerificationError'

  export function sign(
    document: any,
    {
      suite,
      purpose,
      documentLoader,
      expansionMap,
      addSuiteContext,
    }?: {
      suite: LinkedDataSignature
      purpose: ProofPurpose
      documentLoader: (url: string) => Promise<RemoteDocument>
      addSuiteContext?: boolean
    }
  ): Promise<any>

  export function verify(
    document: any,
    {
      suite,
      purpose,
      documentLoader,
      expansionMap,
    }?: {
      suite: any
      purpose: ProofPurpose
      documentLoader?: (url: string) => Promise<RemoteDocument>
    }
  ): Promise<{
    verified: boolean
    results: any[]
    error: VerificationError
  }>

  export const suites: {
    LinkedDataProof: {
      new ({ type }?: { type: any }): LinkedDataProof
    }
    LinkedDataSignature: {
      new ({
        type,
        proof,
        LDKeyClass,
        date,
        key,
        signer,
        verifier,
        useNativeCanonize,
        canonizeOptions,
        contextUrl,
      }?: ConstructorParameters<typeof LinkedDataSignature>[0]): LinkedDataSignature
    }
  }

  export const purposes: {
    AssertionProofPurpose: {
      new ({
        term,
        controller,
        date,
        maxTimestampDelta,
      }?: {
        term?: string
        controller: any
        date: any
        maxTimestampDelta?: number
      }): AssertionProofPurpose
    }
    AuthenticationProofPurpose: {
      new ({
        term,
        controller,
        challenge,
        date,
        domain,
        maxTimestampDelta,
      }?: {
        term?: string
        controller?: string
        challenge: string
        date?: any
        domain?: any
        maxTimestampDelta?: number
      }): AuthenticationProofPurpose
    }
    ControllerProofPurpose: {
      new ({
        term,
        controller,
        date,
        maxTimestampDelta,
      }?: string): ControllerProofPurpose
    }
    ProofPurpose: {
      new ({
        term,
        date,
        maxTimestampDelta,
      }?: string): ProofPurpose
    }
  }

  // these are actually auto assigned to this object in the loading of the main file of the lib
  export function extendContextLoader(documentLoader: any): (url: any) => Promise
  export function strictDocumentLoader(url: any): Promise
}

declare module 'jsonld-signatures/constants' {
  export const SECURITY_CONTEXT_URL: any
  export const SECURITY_CONTEXT_V1_URL: any
  export const SECURITY_CONTEXT_V2_URL: any
  export const SECURITY_PROOF_URL: string
  export const SECURITY_SIGNATURE_URL: string
}

declare module 'jsonld-signatures/contexts' {
  const _exports: Map<any, any>
  export = _exports
}

declare module 'jsonld-signatures/documentLoader' {
  export function extendContextLoader(documentLoader: any): (url: any) => Function
  export function strictDocumentLoader(url: any): Function
}

declare module 'jsonld-signatures/VerificationError' {
  export = VerificationError
  /**
   * Used as an umbrella wrapper around multiple verification errors.
   */
  class VerificationError extends Error {
    /**
     * @param {Error|Error[]} errors
     */
    constructor(errors: Error | Error[])
    errors: any[]
  }
}

declare module 'jsonld-signatures/KeyObject' {
  type BaseKeyObject = {
    id: string
  }

  type SignerKeyObject = {
    signer: { sign: Promise }
    verifier?: never
  } & BaseKeyObject

  type VerifierKeyObject = {
    signer?: never
    verifier: { verify: Promise }
  } & BaseKeyObject

  type KeyObject = SignerKeyObject | VerifierKeyObject
  export = KeyObject
}

declare module 'jsonld-signatures/ProofSet' {
  import type LinkedDataSignature from 'jsonld-signatures/suites/LinkedDataSignature'
  import type ProofPurpose from 'jsonld-signatures/purposes/ProofPurpose'

  export = ProofSet
  class ProofSet {
    add(
      document: object,
      {
        suite,
        purpose,
        documentLoader,
      }?: {
        suite: LinkedDataSignature
        purpose: ProofPurpose
        documentLoader?: (url: string) => Promise<RemoteDocument>
      }
    ): Promise<object>

    verify(
      document: object,
      {
        suite,
        purpose,
        documentLoader,
      }?: {
        suite: LinkedDataSignature | LinkedDataSignature[]
        purpose: ProofPurpose
        documentLoader?: (url: string) => Promise<RemoteDocument>
      }
    ): Promise<{
      verified: boolean
      results: any[]
      error: any
    }>
  }
}

declare module 'jsonld-signatures/purposes' {
  export namespace purposes {
    const AssertionProofPurpose: {
      new ({
        term,
        controller,
        date,
        maxTimestampDelta,
      }?: {
        term?: string
        controller: any
        date: any
        maxTimestampDelta?: number
      }): import('jsonld-signatures/purposes/AssertionProofPurpose')
    }
    const AuthenticationProofPurpose: {
      new ({
        term,
        controller,
        challenge,
        date,
        domain,
        maxTimestampDelta,
      }?: {
        term?: string
        controller: any
        challenge: any
        date: any
        domain: any
        maxTimestampDelta?: number
      }): AuthenticationProofPurpose
    }
    const ControllerProofPurpose: {
      new ({
        term,
        controller,
        date,
        maxTimestampDelta,
      }?: string): import('jsonld-signatures/purposes/ControllerProofPurpose')
    }
    const ProofPurpose: {
      new ({
        term,
        date,
        maxTimestampDelta,
      }?: string): import('jsonld-signatures/purposes/ProofPurpose')
    }
  }
}

declare module 'jsonld-signatures/purposes/AssertionProofPurpose' {
  import ControllerProofPurpose from 'jsonld-signatures/purposes/ControllerProofPurpose'

  export = AssertionProofPurpose

  class AssertionProofPurpose extends ControllerProofPurpose {
    constructor({
      term,
      controller,
      date,
      maxTimestampDelta,
    }?: {
      term?: string
      controller: any
      date: any
      maxTimestampDelta?: number
    })
  }
}

declare module 'jsonld-signatures/purposes/AuthenticationProofPurpose' {
  import ControllerProofPurpose from 'jsonld-signatures/purposes/ControllerProofPurpose'

  export = AuthenticationProofPurpose

  class AuthenticationProofPurpose extends ControllerProofPurpose {
    constructor({
      term,
      controller,
      challenge,
      date,
      domain,
      maxTimestampDelta,
    }?: {
      term?: string
      controller: any
      challenge: any
      date: any
      domain: any
      maxTimestampDelta?: number
    })
    challenge: string
    domain: any
    validate(
      proof: any,
      {
        verificationMethod,
        documentLoader,
        expansionMap,
      }: {
        verificationMethod: any
        documentLoader: any
        expansionMap: any
      }
    ): Promise<{
      valid: boolean
      error: any
    }>
    update(
      proof: any,
      {
        document,
        suite,
        documentLoader,
        expansionMap,
      }: {
        document: any
        suite: any
        documentLoader: any
        expansionMap: any
      }
    ): Promise<any>
  }
}

declare module 'jsonld-signatures/purposes/ControllerProofPurpose' {
  import ProofPurpose from 'jsonld-signatures/purposes/ProofPurpose'

  export = ControllerProofPurpose

  class ControllerProofPurpose extends ProofPurpose {
    controller: any
    _termDefinedByDIDContext: boolean

    validate(
      proof: any,
      {
        verificationMethod,
        documentLoader,
        expansionMap,
      }: {
        verificationMethod: any
        documentLoader: any
        expansionMap: any
      }
    ): Promise<{
      valid: boolean
      error: Error
    }>
  }
}

declare module 'jsonld-signatures/purposes/ProofPurpose' {
  export = ProofPurpose
  class ProofPurpose {
    constructor({ term, date, maxTimestampDelta }?: string)

    term: any
    date: Date
    maxTimestampDelta: any

    validate(
      proof: object,
      {
        expansionMap,
      }: {
        expansionMap: any
      }
    ): Promise<object>

    update(
      proof: object,
      {
        expansionMap,
      }: {
        expansionMap: any
      }
    ): Promise<object>

    match(
      proof: object,
      {
        expansionMap,
      }: {
        expansionMap: any
      }
    ): Promise<boolean>
  }
}

declare module 'jsonld-signatures/suites/LinkedDataProof' {

  export = LinkedDataProof

  class LinkedDataProof {
    type: string

    constructor({ type }?: { type: any })

    createProof(_: { /* document, purpose, proofSet, documentLoader, expansionMap */ }): Promise<object>

    verifyProof(_: { /* proof, document, purpose, proofSet, documentLoader, expansionMap */ }): Promise<{
      verified: boolean
      error?: any
      verificationMethod?: any
    }>

    matchProof({ proof }: { proof: object }): Promise<boolean>
  }
}

declare module 'jsonld-signatures/suites/LinkedDataSignature' {
  import LinkedDataProof from 'jsonld-signatures/suites/LinkedDataProof'
  import type KeyObject from 'jsonld-signatures/KeyObject'

  export = LinkedDataSignature

  export type Signer = {
    sign: ({ data }: { data: string | Uint8Array }) => Uint8Array | any
    id: string
  }

  class LinkedDataSignature extends LinkedDataProof {
    constructor({
      type,
      proof,
      LDKeyClass,
      date,
      key,
      signer,
      verifier,
      useNativeCanonize,
      canonizeOptions,
      contextUrl,
    }?: {
      type: string
      proof?: any
      LDKeyClass: any
      date?: string | Date
      key?: KeyObject
      signer?: { sign: Promise, id: string }
      verifier?: { verify: Promise, id: string }
      useNativeCanonize?: boolean
      canonizeOptions?: any
      contextUrl?: string
    })

    LDKeyClass: any
    contextUrl: any
    proof: any
    verificationMethod: string
    key: any
    signer: Signer

    verifier: {
      verify: Function
      id: string
    }

    canonizeOptions: any
    date: Date
    useNativeCanonize: any
    _hashCache: {
      document: any
      hash: Promise<Uint8Array>
    }

    updateProof({
      proof,
      expansionMap,
    }: {
      proof: object
      expansionMap: Function
    }): Promise<object>

    canonize(
      input: any,
      {
        documentLoader,
        expansionMap,
        skipExpansion,
      }: {
        documentLoader: any
        expansionMap?: any
        skipExpansion?: any
      }
    ): Promise<any>

    canonizeProof(
      proof: any,
      {
        document,
        documentLoader,
        expansionMap,
      }: {
        document: any
        documentLoader?: any
        expansionMap?: any
      }
    ): Promise<any>

    createVerifyData(_: {
      document: object
      proof: object
      proofSet?: any
      documentLoader: Function
      expansionMap?: Function
    }): Promise<{
      Uint8Array
    }>

    getVerificationMethod({ proof, documentLoader }: { proof: any, documentLoader: Function }): Promise<any>

    sign(_: any): Promise<any>

    verifySignature(_: any): Promise<boolean>

    ensureSuiteContext({ document, addSuiteContext }: {
      document: object
      addSuiteContext: boolean
    }): void
  }
}

declare module 'jsonld-signatures/util' {
  /**
   * Converts the given date into W3C datetime format (eg: 2011-03-09T21:55:41Z).
   *
   * @param date the date to convert.
   *
   * @return the date in W3C datetime format.
   */
  export function w3cDate(date: any): string
  /**
   * Concatenates two Uint8Arrays.
   *
   * @param b1 {Uint8Array}.
   * @param b2 {Uint8Array}.
   *
   * @return {Uint8Array} the result.
   */
  export function concat(b1: Uint8Array, b2: Uint8Array): Uint8Array
}
