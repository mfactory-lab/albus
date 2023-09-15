/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as beet from '@metaplex-foundation/beet'
import * as web3 from '@solana/web3.js'
import type { UpdateCircuitVkData } from '../types/UpdateCircuitVkData'
import {
  updateCircuitVkDataBeet,
} from '../types/UpdateCircuitVkData'

/**
 * @category Instructions
 * @category UpdateCircuitVk
 * @category generated
 */
export interface UpdateCircuitVkInstructionArgs {
  data: UpdateCircuitVkData
}
/**
 * @category Instructions
 * @category UpdateCircuitVk
 * @category generated
 */
export const updateCircuitVkStruct = new beet.FixableBeetArgsStruct<
  UpdateCircuitVkInstructionArgs & {
    instructionDiscriminator: number[] /* size: 8 */
  }
>(
  [
    ['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['data', updateCircuitVkDataBeet],
  ],
  'UpdateCircuitVkInstructionArgs',
)
/**
 * Accounts required by the _updateCircuitVk_ instruction
 *
 * @property [_writable_] circuit
 * @property [_writable_, **signer**] authority
 * @category Instructions
 * @category UpdateCircuitVk
 * @category generated
 */
export interface UpdateCircuitVkInstructionAccounts {
  circuit: web3.PublicKey
  authority: web3.PublicKey
  systemProgram?: web3.PublicKey
  anchorRemainingAccounts?: web3.AccountMeta[]
}

export const updateCircuitVkInstructionDiscriminator = [
  229, 19, 102, 93, 187, 107, 67, 117,
]

/**
 * Creates a _UpdateCircuitVk_ instruction.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @param args to provide as instruction data to the program
 *
 * @category Instructions
 * @category UpdateCircuitVk
 * @category generated
 */
export function createUpdateCircuitVkInstruction(
  accounts: UpdateCircuitVkInstructionAccounts,
  args: UpdateCircuitVkInstructionArgs,
  programId = new web3.PublicKey('ALBUSePbQQtw6WavFNyALeyL4ekBADRE28PQJovDDZQz'),
) {
  const [data] = updateCircuitVkStruct.serialize({
    instructionDiscriminator: updateCircuitVkInstructionDiscriminator,
    ...args,
  })
  const keys: web3.AccountMeta[] = [
    {
      pubkey: accounts.circuit,
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
