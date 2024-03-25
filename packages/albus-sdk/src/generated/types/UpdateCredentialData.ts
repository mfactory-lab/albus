/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as beet from '@metaplex-foundation/beet'

export type UpdateCredentialData = {
  uri: string
  name: beet.COption<string>
}

/**
 * @category userTypes
 * @category generated
 */
export const updateCredentialDataBeet
  = new beet.FixableBeetArgsStruct<UpdateCredentialData>(
    [
      ['uri', beet.utf8String],
      ['name', beet.coption(beet.utf8String)],
    ],
    'UpdateCredentialData',
  )
