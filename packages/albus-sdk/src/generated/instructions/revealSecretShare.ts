/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as beet from '@metaplex-foundation/beet'
import * as web3 from '@solana/web3.js'
import type {
  RevealSecretShareData } from '../types/RevealSecretShareData'
import {
  revealSecretShareDataBeet,
} from '../types/RevealSecretShareData'

/**
 * @category Instructions
 * @category RevealSecretShare
 * @category generated
 */
export type RevealSecretShareInstructionArgs = {
  data: RevealSecretShareData
}
/**
 * @category Instructions
 * @category RevealSecretShare
 * @category generated
 */
export const revealSecretShareStruct = new beet.FixableBeetArgsStruct<
  RevealSecretShareInstructionArgs & {
    instructionDiscriminator: number[] /* size: 8 */
  }
>(
  [
    ['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['data', revealSecretShareDataBeet],
  ],
  'RevealSecretShareInstructionArgs',
)
/**
 * Accounts required by the _revealSecretShare_ instruction
 *
 * @property [_writable_] investigationRequestShare
 * @property [_writable_] investigationRequest
 * @property [_writable_] trustee
 * @property [_writable_, **signer**] authority
 * @category Instructions
 * @category RevealSecretShare
 * @category generated
 */
export type RevealSecretShareInstructionAccounts = {
  investigationRequestShare: web3.PublicKey
  investigationRequest: web3.PublicKey
  trustee: web3.PublicKey
  authority: web3.PublicKey
  systemProgram?: web3.PublicKey
  anchorRemainingAccounts?: web3.AccountMeta[]
}

export const revealSecretShareInstructionDiscriminator = [
  137, 113, 154, 99, 90, 161, 41, 235,
]

/**
 * Creates a _RevealSecretShare_ instruction.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @param args to provide as instruction data to the program
 *
 * @category Instructions
 * @category RevealSecretShare
 * @category generated
 */
export function createRevealSecretShareInstruction(
  accounts: RevealSecretShareInstructionAccounts,
  args: RevealSecretShareInstructionArgs,
  programId = new web3.PublicKey('ALBs64hsiHgdg53mvd4bcvNZLfDRhctSVaP7PwAPpsZL'),
) {
  const [data] = revealSecretShareStruct.serialize({
    instructionDiscriminator: revealSecretShareInstructionDiscriminator,
    ...args,
  })
  const keys: web3.AccountMeta[] = [
    {
      pubkey: accounts.investigationRequestShare,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.investigationRequest,
      isWritable: true,
      isSigner: false,
    },
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
