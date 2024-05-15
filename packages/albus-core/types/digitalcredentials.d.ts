declare module '@digitalcredentials/did-io'
declare module '@digitalcredentials/did-method-key'
declare module '@digitalcredentials/vc' {
  import type { VerifiableCredential, VerifiablePresentation, W3CCredential } from '@albus-finance/core'

  type DocumentLoader = unknown
  type Suite = unknown

  export function issue(options: {
    credential: W3CCredential
    suite: Suite
    documentLoader: DocumentLoader
  }): Promise<VerifiableCredential>

  export function verifyCredential(options: {
    credential: VerifiableCredential
    suite: Suite
    documentLoader: DocumentLoader
  }): Promise<VerifiableCredential>

  export function signPresentation(options: {
    presentation: VerifiablePresentation
    suite: Suite
    challenge: string
    documentLoader: DocumentLoader
  }): Promise<VerifiableCredential>
}
declare module '@digitalcredentials/vc-status-list'
declare module '@digitalcredentials/vpqr'
declare module '@digitalbazaar/http-client'

declare module '@digitalcredentials/jsonld-signatures' {
  import { LinkedDataSignature } from 'jsonld-signatures/suites/LinkedDataSignature'
  import { ProofPurpose } from 'jsonld-signatures/purposes/ProofPurpose'
  import type { DocumentLoader } from 'jsonld-signatures/types'

  export type SignOptions = {
    suite: LinkedDataSignature
    purpose: ProofPurpose
    documentLoader?: DocumentLoader
    expansionMap?: any
    compactProof?: boolean
  }

  export type VerifyOptions = {
    suite: LinkedDataSignature | LinkedDataSignature[]
    purpose: ProofPurpose
    documentLoader?: DocumentLoader
    expansionMap?: any
    compactProof?: boolean
  }

  export type VerifyResult = {
    verified: boolean
    results: Array<{
      proof: any
      verified: boolean
      purposeResult: any
    }>
    error?: Error
  }

  export function sign(
    document: any,
    options: SignOptions
  ): Promise<any>

  export function verify(
    document: any,
    options: VerifyOptions
  ): Promise<VerifyResult>

  export namespace suites {
    export class RsaSignature2018 extends LinkedDataSignature {
      constructor(options: any)
    }
    export class Ed25519Signature2018 extends LinkedDataSignature {
      constructor(options: any)
    }
    export class Ed25519Signature2020 extends LinkedDataSignature {
      constructor(options: any)
    }
  }

  export namespace purposes {
    export class AssertionProofPurpose extends ProofPurpose {
      constructor(options?: any)
    }
    export class AuthenticationProofPurpose extends ProofPurpose {
      constructor(options?: any)
    }
    export class ControllerProofPurpose extends ProofPurpose {
      constructor(options?: any)
    }
  }
}

declare module '@digitalcredentials/ed25519-signature-2020' {
  export class Ed25519Signature2020 {
    constructor(options?: unknown)
  }
}

declare module '@digitalcredentials/ed25519-verification-key-2020'
declare module '@digitalcredentials/lru-memoize'
declare module 'jsonld-document-loader'
declare module '@interop/did-web-resolver'
declare module 'json-canonicalize'
declare module 'react-native-keychain'
declare module 'react-hooks-outside'
declare module 'validator'
declare module '@microsoft/msrcrypto'
