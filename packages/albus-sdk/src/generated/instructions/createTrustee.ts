/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as beet from '@metaplex-foundation/beet'
import * as web3 from '@solana/web3.js'
import type {
  CreateTrusteeData } from '../types/CreateTrusteeData'
import {
  createTrusteeDataBeet,
} from '../types/CreateTrusteeData'

/**
 * @category Instructions
 * @category CreateTrustee
 * @category generated
 */
export type CreateTrusteeInstructionArgs = {
  data: CreateTrusteeData
}
/**
 * @category Instructions
 * @category CreateTrustee
 * @category generated
 */
export const createTrusteeStruct = new beet.FixableBeetArgsStruct<
  CreateTrusteeInstructionArgs & {
    instructionDiscriminator: number[] /* size: 8 */
  }
>(
  [
    ['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['data', createTrusteeDataBeet],
  ],
  'CreateTrusteeInstructionArgs',
)
/**
 * Accounts required by the _createTrustee_ instruction
 *
 * @property [_writable_] trustee
 * @property [_writable_, **signer**] authority
 * @category Instructions
 * @category CreateTrustee
 * @category generated
 */
export type CreateTrusteeInstructionAccounts = {
  trustee: web3.PublicKey
  authority: web3.PublicKey
  systemProgram?: web3.PublicKey
  anchorRemainingAccounts?: web3.AccountMeta[]
}

export const createTrusteeInstructionDiscriminator = [
  227, 237, 106, 208, 206, 218, 80, 6,
]

/**
 * Creates a _CreateTrustee_ instruction.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @param args to provide as instruction data to the program
 *
 * @category Instructions
 * @category CreateTrustee
 * @category generated
 */
export function createCreateTrusteeInstruction(
  accounts: CreateTrusteeInstructionAccounts,
  args: CreateTrusteeInstructionArgs,
  programId = new web3.PublicKey('ALBUSbdydS2qoQXXeFfr4mqc9LFw5xWmUMdB4tcscHhi'),
) {
  const [data] = createTrusteeStruct.serialize({
    instructionDiscriminator: createTrusteeInstructionDiscriminator,
    ...args,
  })
  const keys: web3.AccountMeta[] = [
    {
      pubkey: accounts.trustee,
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
