/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as beet from '@metaplex-foundation/beet'
import * as web3 from '@solana/web3.js'
import type {
  CreateCircuitData } from '../types/CreateCircuitData'
import {
  createCircuitDataBeet,
} from '../types/CreateCircuitData'

/**
 * @category Instructions
 * @category CreateCircuit
 * @category generated
 */
export type CreateCircuitInstructionArgs = {
  data: CreateCircuitData
}
/**
 * @category Instructions
 * @category CreateCircuit
 * @category generated
 */
export const createCircuitStruct = new beet.FixableBeetArgsStruct<
  CreateCircuitInstructionArgs & {
    instructionDiscriminator: number[] /* size: 8 */
  }
>(
  [
    ['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['data', createCircuitDataBeet],
  ],
  'CreateCircuitInstructionArgs',
)
/**
 * Accounts required by the _createCircuit_ instruction
 *
 * @property [_writable_] circuit
 * @property [_writable_, **signer**] authority
 * @category Instructions
 * @category CreateCircuit
 * @category generated
 */
export type CreateCircuitInstructionAccounts = {
  circuit: web3.PublicKey
  authority: web3.PublicKey
  systemProgram?: web3.PublicKey
  anchorRemainingAccounts?: web3.AccountMeta[]
}

export const createCircuitInstructionDiscriminator = [
  35, 7, 152, 132, 75, 65, 176, 162,
]

/**
 * Creates a _CreateCircuit_ instruction.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @param args to provide as instruction data to the program
 *
 * @category Instructions
 * @category CreateCircuit
 * @category generated
 */
export function createCreateCircuitInstruction(
  accounts: CreateCircuitInstructionAccounts,
  args: CreateCircuitInstructionArgs,
  programId = new web3.PublicKey('ALBs64hsiHgdg53mvd4bcvNZLfDRhctSVaP7PwAPpsZL'),
) {
  const [data] = createCircuitStruct.serialize({
    instructionDiscriminator: createCircuitInstructionDiscriminator,
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
