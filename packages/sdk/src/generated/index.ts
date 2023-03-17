import { PublicKey } from '@solana/web3.js'
export * from './errors'
export * from './instructions'

/**
 * Program address
 *
 * @category constants
 * @category generated
 */
export const PROGRAM_ADDRESS = '8Q3WDsNM7cBy7xSXqZMhR2LzGfGKgYAdWWLPKpj9orJb'

/**
 * Program public key
 *
 * @category constants
 * @category generated
 */
export const PROGRAM_ID = new PublicKey(PROGRAM_ADDRESS)
