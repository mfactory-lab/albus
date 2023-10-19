/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as beet from '@metaplex-foundation/beet'
import * as web3 from '@solana/web3.js'
import type { UpdateProofRequestData } from '../types/UpdateProofRequestData'
import {
  updateProofRequestDataBeet,
} from '../types/UpdateProofRequestData'

/**
 * @category Instructions
 * @category UpdateProofRequest
 * @category generated
 */
export interface UpdateProofRequestInstructionArgs {
  data: UpdateProofRequestData
}
/**
 * @category Instructions
 * @category UpdateProofRequest
 * @category generated
 */
export const updateProofRequestStruct = new beet.BeetArgsStruct<
  UpdateProofRequestInstructionArgs & {
    instructionDiscriminator: number[] /* size: 8 */
  }
>(
  [
    ['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['data', updateProofRequestDataBeet],
  ],
  'UpdateProofRequestInstructionArgs',
)
/**
 * Accounts required by the _updateProofRequest_ instruction
 *
 * @property [_writable_] proofRequest
 * @property [_writable_, **signer**] authority
 * @category Instructions
 * @category UpdateProofRequest
 * @category generated
 */
export interface UpdateProofRequestInstructionAccounts {
  proofRequest: web3.PublicKey
  authority: web3.PublicKey
  systemProgram?: web3.PublicKey
  anchorRemainingAccounts?: web3.AccountMeta[]
}

export const updateProofRequestInstructionDiscriminator = [
  248, 138, 24, 233, 171, 52, 72, 43,
]

/**
 * Creates a _UpdateProofRequest_ instruction.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @param args to provide as instruction data to the program
 *
 * @category Instructions
 * @category UpdateProofRequest
 * @category generated
 */
export function createUpdateProofRequestInstruction(
  accounts: UpdateProofRequestInstructionAccounts,
  args: UpdateProofRequestInstructionArgs,
  programId = new web3.PublicKey('ALBs64hsiHgdg53mvd4bcvNZLfDRhctSVaP7PwAPpsZL'),
) {
  const [data] = updateProofRequestStruct.serialize({
    instructionDiscriminator: updateProofRequestInstructionDiscriminator,
    ...args,
  })
  const keys: web3.AccountMeta[] = [
    {
      pubkey: accounts.proofRequest,
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