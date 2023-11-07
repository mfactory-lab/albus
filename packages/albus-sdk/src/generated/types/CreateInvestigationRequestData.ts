/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import type * as web3 from '@solana/web3.js'
import * as beetSolana from '@metaplex-foundation/beet-solana'
import * as beet from '@metaplex-foundation/beet'

export type CreateInvestigationRequestData = {
  encryptionKey: web3.PublicKey
  trustees: web3.PublicKey[]
}

/**
 * @category userTypes
 * @category generated
 */
export const createInvestigationRequestDataBeet
  = new beet.FixableBeetArgsStruct<CreateInvestigationRequestData>(
    [
      ['encryptionKey', beetSolana.publicKey],
      ['trustees', beet.array(beetSolana.publicKey)],
    ],
    'CreateInvestigationRequestData',
  )
