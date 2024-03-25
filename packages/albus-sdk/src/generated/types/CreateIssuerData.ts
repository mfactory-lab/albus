/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import type * as web3 from '@solana/web3.js'
import * as beet from '@metaplex-foundation/beet'
import * as beetSolana from '@metaplex-foundation/beet-solana'

export type CreateIssuerData = {
  code: string
  name: string
  description: string
  authority: web3.PublicKey
  zkAuthority: number[] /* size: 64 */
}

/**
 * @category userTypes
 * @category generated
 */
export const createIssuerDataBeet
  = new beet.FixableBeetArgsStruct<CreateIssuerData>(
    [
      ['code', beet.utf8String],
      ['name', beet.utf8String],
      ['description', beet.utf8String],
      ['authority', beetSolana.publicKey],
      ['zkAuthority', beet.uniformFixedSizeArray(beet.u8, 64)],
    ],
    'CreateIssuerData',
  )
