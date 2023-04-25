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
export const PROGRAM_ADDRESS = '6kGaStV1raq9ZT8rKAm1ki9BAoL6JMqRMy5ivYzdyuzg'

/**
 * Program public key
 *
 * @category constants
 * @category generated
 */
export const PROGRAM_ID = new PublicKey(PROGRAM_ADDRESS)
