import context from './context'

export * from './BabyJubJubKey2021'
export * from './BabyJubJubSignature2021Suite'
// export * from './BabyJubJubSignatureProof'

/**
 * Credential context URL required for Albus credentials.
 */
export const CONTEXT_URL = 'https://albus.finance/contexts/credentials'

export const AlbusCredentialV1 = {
  CONTEXT_URL,
}

export const validationContexts = {
  [AlbusCredentialV1.CONTEXT_URL]: context,
}
