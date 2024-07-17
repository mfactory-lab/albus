/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as beet from '@metaplex-foundation/beet'

export type UpdateCredentialData = {
  name: beet.COption<string>
  uri: string
}

/**
 * @category userTypes
 * @category generated
 */
export const updateCredentialDataBeet
  = new beet.FixableBeetArgsStruct<UpdateCredentialData>(
    [
      ['name', beet.coption(beet.utf8String)],
      ['uri', beet.utf8String],
    ],
    'UpdateCredentialData',
  )
