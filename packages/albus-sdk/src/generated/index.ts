import { PublicKey } from '@solana/web3.js'

export * from './accounts'
export * from './errors'
export * from './instructions'
export * from './types'

/**
 * Program address
 *
 * @category constants
 * @category generated
 */
export const PROGRAM_ADDRESS = 'ALBUSbdydS2qoQXXeFfr4mqc9LFw5xWmUMdB4tcscHhi'

/**
 * Program public key
 *
 * @category constants
 * @category generated
 */
export const PROGRAM_ID = new PublicKey(PROGRAM_ADDRESS)
