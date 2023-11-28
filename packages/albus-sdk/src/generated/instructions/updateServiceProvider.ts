/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as beet from '@metaplex-foundation/beet'
import * as web3 from '@solana/web3.js'
import type {
  UpdateServiceProviderData } from '../types/UpdateServiceProviderData'
import {
  updateServiceProviderDataBeet,
} from '../types/UpdateServiceProviderData'

/**
 * @category Instructions
 * @category UpdateServiceProvider
 * @category generated
 */
export type UpdateServiceProviderInstructionArgs = {
  data: UpdateServiceProviderData
}
/**
 * @category Instructions
 * @category UpdateServiceProvider
 * @category generated
 */
export const updateServiceProviderStruct = new beet.FixableBeetArgsStruct<
  UpdateServiceProviderInstructionArgs & {
    instructionDiscriminator: number[] /* size: 8 */
  }
>(
  [
    ['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['data', updateServiceProviderDataBeet],
  ],
  'UpdateServiceProviderInstructionArgs',
)
/**
 * Accounts required by the _updateServiceProvider_ instruction
 *
 * @property [_writable_] serviceProvider
 * @property [_writable_, **signer**] authority
 * @category Instructions
 * @category UpdateServiceProvider
 * @category generated
 */
export type UpdateServiceProviderInstructionAccounts = {
  serviceProvider: web3.PublicKey
  authority: web3.PublicKey
  systemProgram?: web3.PublicKey
  anchorRemainingAccounts?: web3.AccountMeta[]
}

export const updateServiceProviderInstructionDiscriminator = [
  16, 250, 215, 91, 184, 33, 51, 19,
]

/**
 * Creates a _UpdateServiceProvider_ instruction.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @param args to provide as instruction data to the program
 *
 * @category Instructions
 * @category UpdateServiceProvider
 * @category generated
 */
export function createUpdateServiceProviderInstruction(
  accounts: UpdateServiceProviderInstructionAccounts,
  args: UpdateServiceProviderInstructionArgs,
  programId = new web3.PublicKey('ALBUSbdydS2qoQXXeFfr4mqc9LFw5xWmUMdB4tcscHhi'),
) {
  const [data] = updateServiceProviderStruct.serialize({
    instructionDiscriminator: updateServiceProviderInstructionDiscriminator,
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
