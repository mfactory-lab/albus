/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as beet from '@metaplex-foundation/beet'
import * as web3 from '@solana/web3.js'
import type { UpdateCredentialData } from '../types/UpdateCredentialData'
import {
  updateCredentialDataBeet,
} from '../types/UpdateCredentialData'

/**
 * @category Instructions
 * @category UpdateCredential
 * @category generated
 */
export interface UpdateCredentialInstructionArgs {
  data: UpdateCredentialData
}
/**
 * @category Instructions
 * @category UpdateCredential
 * @category generated
 */
export const updateCredentialStruct = new beet.FixableBeetArgsStruct<
  UpdateCredentialInstructionArgs & {
    instructionDiscriminator: number[] /* size: 8 */
  }
>(
  [
    ['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['data', updateCredentialDataBeet],
  ],
  'UpdateCredentialInstructionArgs',
)
/**
 * Accounts required by the _updateCredential_ instruction
 *
 * @property [_writable_] albusAuthority
 * @property [] tokenAccount
 * @property [] mint
 * @property [_writable_] metadataAccount
 * @property [_writable_, **signer**] authority
 * @property [] metadataProgram
 * @property [] sysvarInstructions
 * @category Instructions
 * @category UpdateCredential
 * @category generated
 */
export interface UpdateCredentialInstructionAccounts {
  albusAuthority: web3.PublicKey
  tokenAccount: web3.PublicKey
  mint: web3.PublicKey
  metadataAccount: web3.PublicKey
  authority: web3.PublicKey
  metadataProgram: web3.PublicKey
  sysvarInstructions: web3.PublicKey
  systemProgram?: web3.PublicKey
  anchorRemainingAccounts?: web3.AccountMeta[]
}

export const updateCredentialInstructionDiscriminator = [
  96, 104, 180, 182, 200, 19, 178, 1,
]

/**
 * Creates a _UpdateCredential_ instruction.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @param args to provide as instruction data to the program
 *
 * @category Instructions
 * @category UpdateCredential
 * @category generated
 */
export function createUpdateCredentialInstruction(
  accounts: UpdateCredentialInstructionAccounts,
  args: UpdateCredentialInstructionArgs,
  programId = new web3.PublicKey('ALBs64hsiHgdg53mvd4bcvNZLfDRhctSVaP7PwAPpsZL'),
) {
  const [data] = updateCredentialStruct.serialize({
    instructionDiscriminator: updateCredentialInstructionDiscriminator,
    ...args,
  })
  const keys: web3.AccountMeta[] = [
    {
      pubkey: accounts.albusAuthority,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.tokenAccount,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.mint,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.metadataAccount,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.authority,
      isWritable: true,
      isSigner: true,
    },
    {
      pubkey: accounts.metadataProgram,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.sysvarInstructions,
      isWritable: false,
      isSigner: false,
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