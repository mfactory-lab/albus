/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as beet from '@metaplex-foundation/beet'
import * as web3 from '@solana/web3.js'
import type {
  UpdatePolicyData } from '../types/UpdatePolicyData'
import {
  updatePolicyDataBeet,
} from '../types/UpdatePolicyData'

/**
 * @category Instructions
 * @category UpdatePolicy
 * @category generated
 */
export type UpdatePolicyInstructionArgs = {
  data: UpdatePolicyData
}
/**
 * @category Instructions
 * @category UpdatePolicy
 * @category generated
 */
export const updatePolicyStruct = new beet.FixableBeetArgsStruct<
  UpdatePolicyInstructionArgs & {
    instructionDiscriminator: number[] /* size: 8 */
  }
>(
  [
    ['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['data', updatePolicyDataBeet],
  ],
  'UpdatePolicyInstructionArgs',
)
/**
 * Accounts required by the _updatePolicy_ instruction
 *
 * @property [_writable_] policy
 * @property [_writable_] serviceProvider
 * @property [_writable_, **signer**] authority
 * @category Instructions
 * @category UpdatePolicy
 * @category generated
 */
export type UpdatePolicyInstructionAccounts = {
  policy: web3.PublicKey
  serviceProvider: web3.PublicKey
  authority: web3.PublicKey
  systemProgram?: web3.PublicKey
  anchorRemainingAccounts?: web3.AccountMeta[]
}

export const updatePolicyInstructionDiscriminator = [
  212, 245, 246, 7, 163, 151, 18, 57,
]

/**
 * Creates a _UpdatePolicy_ instruction.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @param args to provide as instruction data to the program
 *
 * @category Instructions
 * @category UpdatePolicy
 * @category generated
 */
export function createUpdatePolicyInstruction(
  accounts: UpdatePolicyInstructionAccounts,
  args: UpdatePolicyInstructionArgs,
  programId = new web3.PublicKey('ALBUSbdydS2qoQXXeFfr4mqc9LFw5xWmUMdB4tcscHhi'),
) {
  const [data] = updatePolicyStruct.serialize({
    instructionDiscriminator: updatePolicyInstructionDiscriminator,
    ...args,
  })
  const keys: web3.AccountMeta[] = [
    {
      pubkey: accounts.policy,
      isWritable: true,
      isSigner: false,
    },
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
