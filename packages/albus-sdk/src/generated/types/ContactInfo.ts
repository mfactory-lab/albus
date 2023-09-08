/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as beet from '@metaplex-foundation/beet'

export interface ContactInfo {
  kind: number
  value: string
}

/**
 * @category userTypes
 * @category generated
 */
export const contactInfoBeet = new beet.FixableBeetArgsStruct<ContactInfo>(
  [
    ['kind', beet.u8],
    ['value', beet.utf8String],
  ],
  'ContactInfo',
)
