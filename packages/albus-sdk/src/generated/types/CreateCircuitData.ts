/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as beet from '@metaplex-foundation/beet'

export interface CreateCircuitData {
  code: string
  name: string
  description: string
  wasmUri: string
  zkeyUri: string
  privateSignals: string[]
  publicSignals: string[]
}

/**
 * @category userTypes
 * @category generated
 */
export const createCircuitDataBeet
  = new beet.FixableBeetArgsStruct<CreateCircuitData>(
    [
      ['code', beet.utf8String],
      ['name', beet.utf8String],
      ['description', beet.utf8String],
      ['wasmUri', beet.utf8String],
      ['zkeyUri', beet.utf8String],
      ['privateSignals', beet.array(beet.utf8String)],
      ['publicSignals', beet.array(beet.utf8String)],
    ],
    'CreateCircuitData',
  )