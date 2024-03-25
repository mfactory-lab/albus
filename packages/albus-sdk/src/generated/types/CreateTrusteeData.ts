/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import type * as web3 from '@solana/web3.js'
import * as beet from '@metaplex-foundation/beet'
import * as beetSolana from '@metaplex-foundation/beet-solana'

export type CreateTrusteeData = {
  key: number[] /* size: 32 */
  name: string
  email: string
  website: string
  authority: beet.COption<web3.PublicKey>
}

/**
 * @category userTypes
 * @category generated
 */
export const createTrusteeDataBeet
  = new beet.FixableBeetArgsStruct<CreateTrusteeData>(
    [
      ['key', beet.uniformFixedSizeArray(beet.u8, 32)],
      ['name', beet.utf8String],
      ['email', beet.utf8String],
      ['website', beet.utf8String],
      ['authority', beet.coption(beetSolana.publicKey)],
    ],
    'CreateTrusteeData',
  )
