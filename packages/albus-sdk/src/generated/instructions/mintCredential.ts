/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as splToken from '@solana/spl-token'
import * as beet from '@metaplex-foundation/beet'
import * as web3 from '@solana/web3.js'
import type { MintCredentialData } from '../types/MintCredentialData'
import {
  mintCredentialDataBeet,
} from '../types/MintCredentialData'

/**
 * @category Instructions
 * @category MintCredential
 * @category generated
 */
export interface MintCredentialInstructionArgs {
  data: MintCredentialData
}
/**
 * @category Instructions
 * @category MintCredential
 * @category generated
 */
export const mintCredentialStruct = new beet.FixableBeetArgsStruct<
  MintCredentialInstructionArgs & {
    instructionDiscriminator: number[] /* size: 8 */
  }
>(
  [
    ['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['data', mintCredentialDataBeet],
  ],
  'MintCredentialInstructionArgs',
)
/**
 * Accounts required by the _mintCredential_ instruction
 *
 * @property [_writable_] albusAuthority
 * @property [_writable_] tokenAccount
 * @property [_writable_] tokenRecord (optional)
 * @property [_writable_, **signer**] mint
 * @property [_writable_] metadataAccount
 * @property [_writable_] editionAccount
 * @property [_writable_, **signer**] authority
 * @property [] metadataProgram
 * @property [] sysvarInstructions
 * @category Instructions
 * @category MintCredential
 * @category generated
 */
export interface MintCredentialInstructionAccounts {
  albusAuthority: web3.PublicKey
  tokenAccount: web3.PublicKey
  tokenRecord?: web3.PublicKey
  mint: web3.PublicKey
  metadataAccount: web3.PublicKey
  editionAccount: web3.PublicKey
  authority: web3.PublicKey
  tokenProgram?: web3.PublicKey
  ataProgram?: web3.PublicKey
  metadataProgram: web3.PublicKey
  sysvarInstructions: web3.PublicKey
  systemProgram?: web3.PublicKey
  anchorRemainingAccounts?: web3.AccountMeta[]
}

export const mintCredentialInstructionDiscriminator = [
  136, 108, 131, 240, 163, 102, 204, 13,
]

/**
 * Creates a _MintCredential_ instruction.
 *
 * Optional accounts that are not provided default to the program ID since
 * this was indicated in the IDL from which this instruction was generated.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @param args to provide as instruction data to the program
 *
 * @category Instructions
 * @category MintCredential
 * @category generated
 */
export function createMintCredentialInstruction(
  accounts: MintCredentialInstructionAccounts,
  args: MintCredentialInstructionArgs,
  programId = new web3.PublicKey('ALBs64hsiHgdg53mvd4bcvNZLfDRhctSVaP7PwAPpsZL'),
) {
  const [data] = mintCredentialStruct.serialize({
    instructionDiscriminator: mintCredentialInstructionDiscriminator,
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
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.tokenRecord ?? programId,
      isWritable: accounts.tokenRecord != null,
      isSigner: false,
    },
    {
      pubkey: accounts.mint,
      isWritable: true,
      isSigner: true,
    },
    {
      pubkey: accounts.metadataAccount,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.editionAccount,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.authority,
      isWritable: true,
      isSigner: true,
    },
    {
      pubkey: accounts.tokenProgram ?? splToken.TOKEN_PROGRAM_ID,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.ataProgram ?? splToken.ASSOCIATED_TOKEN_PROGRAM_ID,
      isWritable: false,
      isSigner: false,
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
