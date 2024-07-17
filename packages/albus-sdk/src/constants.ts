import { PublicKey } from '@solana/web3.js'

export const NFT_SYMBOL_PREFIX = 'ALBUS'
export const CREDENTIAL_NAME = 'Albus Digital Credential'
export const CREDENTIAL_SYMBOL_CODE = 'DC'

export const MAX_CREDENTIAL_REQUIREMENT_KEY_LEN = 32
export const MAX_CREDENTIAL_REQUIREMENT_VALUE_LEN = 64

/**
 * Development program ID
 */
export const DEV_PROGRAM_ID = new PublicKey('ALBSoqJrZeZZ423xWme5nozNcozCtMvDWTZZmQLMT3fp')

// Computation Units
export const CREATE_CREDENTIAL_CU = 300_000
export const PROVE_PROOF_REQUEST_CU = 300_000
export const VERIFY_PROOF_REQUEST_CU = 600_000
