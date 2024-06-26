/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as beet from '@metaplex-foundation/beet'
import * as web3 from '@solana/web3.js'
import type {
  CreatePolicyData } from '../types/CreatePolicyData'
import {
  createPolicyDataBeet,
} from '../types/CreatePolicyData'

/**
 * @category Instructions
 * @category CreatePolicy
 * @category generated
 */
export type CreatePolicyInstructionArgs = {
  data: CreatePolicyData
}
/**
 * @category Instructions
 * @category CreatePolicy
 * @category generated
 */
export const createPolicyStruct = new beet.FixableBeetArgsStruct<
  CreatePolicyInstructionArgs & {
    instructionDiscriminator: number[] /* size: 8 */
  }
>(
  [
    ['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['data', createPolicyDataBeet],
  ],
  'CreatePolicyInstructionArgs',
)
/**
 * Accounts required by the _createPolicy_ instruction
 *
 * @property [_writable_] serviceProvider
 * @property [] circuit
 * @property [_writable_] policy
 * @property [_writable_, **signer**] authority
 * @category Instructions
 * @category CreatePolicy
 * @category generated
 */
export type CreatePolicyInstructionAccounts = {
  serviceProvider: web3.PublicKey
  circuit: web3.PublicKey
  policy: web3.PublicKey
  authority: web3.PublicKey
  systemProgram?: web3.PublicKey
  anchorRemainingAccounts?: web3.AccountMeta[]
}

export const createPolicyInstructionDiscriminator = [
  27, 81, 33, 27, 196, 103, 246, 53,
]

/**
 * Creates a _CreatePolicy_ instruction.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @param args to provide as instruction data to the program
 *
 * @category Instructions
 * @category CreatePolicy
 * @category generated
 */
export function createCreatePolicyInstruction(
  accounts: CreatePolicyInstructionAccounts,
  args: CreatePolicyInstructionArgs,
  programId = new web3.PublicKey('ALBUSbdydS2qoQXXeFfr4mqc9LFw5xWmUMdB4tcscHhi'),
) {
  const [data] = createPolicyStruct.serialize({
    instructionDiscriminator: createPolicyInstructionDiscriminator,
    ...args,
  })
  const keys: web3.AccountMeta[] = [
    {
      pubkey: accounts.serviceProvider,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.circuit,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.policy,
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
