/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as beet from '@metaplex-foundation/beet'
import * as web3 from '@solana/web3.js'
import type {
  CreateInvestigationRequestData } from '../types/CreateInvestigationRequestData'
import {
  createInvestigationRequestDataBeet,
} from '../types/CreateInvestigationRequestData'

/**
 * @category Instructions
 * @category CreateInvestigationRequest
 * @category generated
 */
export type CreateInvestigationRequestInstructionArgs = {
  data: CreateInvestigationRequestData
}
/**
 * @category Instructions
 * @category CreateInvestigationRequest
 * @category generated
 */
export const createInvestigationRequestStruct = new beet.FixableBeetArgsStruct<
  CreateInvestigationRequestInstructionArgs & {
    instructionDiscriminator: number[] /* size: 8 */
  }
>(
  [
    ['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['data', createInvestigationRequestDataBeet],
  ],
  'CreateInvestigationRequestInstructionArgs',
)
/**
 * Accounts required by the _createInvestigationRequest_ instruction
 *
 * @property [_writable_] investigationRequest
 * @property [_writable_] proofRequest
 * @property [] serviceProvider
 * @property [_writable_, **signer**] authority
 * @category Instructions
 * @category CreateInvestigationRequest
 * @category generated
 */
export type CreateInvestigationRequestInstructionAccounts = {
  investigationRequest: web3.PublicKey
  proofRequest: web3.PublicKey
  serviceProvider: web3.PublicKey
  authority: web3.PublicKey
  systemProgram?: web3.PublicKey
  anchorRemainingAccounts?: web3.AccountMeta[]
}

export const createInvestigationRequestInstructionDiscriminator = [
  252, 6, 45, 22, 207, 47, 209, 212,
]

/**
 * Creates a _CreateInvestigationRequest_ instruction.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @param args to provide as instruction data to the program
 *
 * @category Instructions
 * @category CreateInvestigationRequest
 * @category generated
 */
export function createCreateInvestigationRequestInstruction(
  accounts: CreateInvestigationRequestInstructionAccounts,
  args: CreateInvestigationRequestInstructionArgs,
  programId = new web3.PublicKey('ALBs64hsiHgdg53mvd4bcvNZLfDRhctSVaP7PwAPpsZL'),
) {
  const [data] = createInvestigationRequestStruct.serialize({
    instructionDiscriminator:
      createInvestigationRequestInstructionDiscriminator,
    ...args,
  })
  const keys: web3.AccountMeta[] = [
    {
      pubkey: accounts.investigationRequest,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.proofRequest,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.serviceProvider,
      isWritable: false,
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
