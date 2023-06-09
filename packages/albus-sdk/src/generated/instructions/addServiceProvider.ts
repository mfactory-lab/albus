/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as beet from '@metaplex-foundation/beet'
import * as web3 from '@solana/web3.js'
import type { AddServiceProviderData } from '../types/AddServiceProviderData'
import {
  addServiceProviderDataBeet,
} from '../types/AddServiceProviderData'

/**
 * @category Instructions
 * @category AddServiceProvider
 * @category generated
 */
export interface AddServiceProviderInstructionArgs {
  data: AddServiceProviderData
}
/**
 * @category Instructions
 * @category AddServiceProvider
 * @category generated
 */
export const addServiceProviderStruct = new beet.FixableBeetArgsStruct<
  AddServiceProviderInstructionArgs & {
    instructionDiscriminator: number[] /* size: 8 */
  }
>(
  [
    ['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['data', addServiceProviderDataBeet],
  ],
  'AddServiceProviderInstructionArgs',
)
/**
 * Accounts required by the _addServiceProvider_ instruction
 *
 * @property [_writable_] serviceProvider
 * @property [_writable_, **signer**] authority
 * @category Instructions
 * @category AddServiceProvider
 * @category generated
 */
export interface AddServiceProviderInstructionAccounts {
  serviceProvider: web3.PublicKey
  authority: web3.PublicKey
  systemProgram?: web3.PublicKey
  anchorRemainingAccounts?: web3.AccountMeta[]
}

export const addServiceProviderInstructionDiscriminator = [
  122, 238, 46, 138, 102, 109, 197, 177,
]

/**
 * Creates a _AddServiceProvider_ instruction.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @param args to provide as instruction data to the program
 *
 * @category Instructions
 * @category AddServiceProvider
 * @category generated
 */
export function createAddServiceProviderInstruction(
  accounts: AddServiceProviderInstructionAccounts,
  args: AddServiceProviderInstructionArgs,
  programId = new web3.PublicKey('ALBUSePbQQtw6WavFNyALeyL4ekBADRE28PQJovDDZQz'),
) {
  const [data] = addServiceProviderStruct.serialize({
    instructionDiscriminator: addServiceProviderInstructionDiscriminator,
    ...args,
  })
  const keys: web3.AccountMeta[] = [
    {
      pubkey: accounts.serviceProvider,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.authority,
      isWritable: true,
      isSigner: true,
    },
    {
      pubkey: accounts.systemProgram ?? web3.SystemProgram.programId,
      isWritable: false,
      isSigner: false,
    },
  ]

  if (accounts.anchorRemainingAccounts != null) {
    for (const acc of accounts.anchorRemainingAccounts) {
      keys.push(acc)
    }
  }

  const ix = new web3.TransactionInstruction({
    programId,
    keys,
    data,
  })
  return ix
}
