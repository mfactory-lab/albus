declare module '@digitalcredentials/did-io';
declare module '@digitalcredentials/did-method-key';
declare module '@digitalcredentials/vc' {
  import type { VerifiableCredential, W3CCredential } from '@albus-finance/core'

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
}
declare module '@digitalcredentials/vc-status-list';
declare module '@digitalcredentials/vpqr';
declare module '@digitalbazaar/http-client';
declare module '@digitalcredentials/jsonld-signatures';
declare module '@digitalcredentials/ed25519-signature-2020' {
  export class Ed25519Signature2020 {
    constructor(options?: unknown)
  }
}
declare module '@digitalcredentials/ed25519-verification-key-2020';
declare module '@digitalcredentials/lru-memoize';
declare module 'jsonld-document-loader';
declare module '@interop/did-web-resolver';
declare module 'json-canonicalize';
declare module 'react-native-keychain';
declare module 'react-hooks-outside';
declare module 'validator';
declare module '@microsoft/msrcrypto';
