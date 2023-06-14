/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as beet from '@metaplex-foundation/beet'

export interface CreateProofRequestData {
  expiresIn: number
}

/**
 * @category userTypes
 * @category generated
 */
export const createProofRequestDataBeet
  = new beet.BeetArgsStruct<CreateProofRequestData>(
    [['expiresIn', beet.u32]],
    'CreateProofRequestData',
  )
