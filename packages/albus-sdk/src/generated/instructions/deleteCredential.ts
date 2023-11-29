/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as splToken from '@solana/spl-token'
import * as beet from '@metaplex-foundation/beet'
import * as web3 from '@solana/web3.js'

/**
 * @category Instructions
 * @category DeleteCredential
 * @category generated
 */
export const deleteCredentialStruct = new beet.BeetArgsStruct<{
  instructionDiscriminator: number[] /* size: 8 */
}>(
  [['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)]],
  'DeleteCredentialInstructionArgs',
)
/**
 * Accounts required by the _deleteCredential_ instruction
 *
 * @property [_writable_] albusAuthority
 * @property [_writable_] tokenAccount
 * @property [_writable_] mint
 * @property [_writable_] metadataAccount
 * @property [_writable_] editionAccount
 * @property [_writable_, **signer**] authority
 * @property [] metadataProgram
 * @property [] sysvarInstructions
 * @category Instructions
 * @category DeleteCredential
 * @category generated
 */
export type DeleteCredentialInstructionAccounts = {
  albusAuthority: web3.PublicKey
  tokenAccount: web3.PublicKey
  mint: web3.PublicKey
  metadataAccount: web3.PublicKey
  editionAccount: web3.PublicKey
  authority: web3.PublicKey
  metadataProgram: web3.PublicKey
  tokenProgram?: web3.PublicKey
  sysvarInstructions: web3.PublicKey
  systemProgram?: web3.PublicKey
  anchorRemainingAccounts?: web3.AccountMeta[]
}

export const deleteCredentialInstructionDiscriminator = [
  20, 216, 8, 226, 116, 228, 193, 12,
]

/**
 * Creates a _DeleteCredential_ instruction.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @category Instructions
 * @category DeleteCredential
 * @category generated
 */
export function createDeleteCredentialInstruction(
  accounts: DeleteCredentialInstructionAccounts,
  programId = new web3.PublicKey('ALBUSbdydS2qoQXXeFfr4mqc9LFw5xWmUMdB4tcscHhi'),
) {
  const [data] = deleteCredentialStruct.serialize({
    instructionDiscriminator: deleteCredentialInstructionDiscriminator,
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
      pubkey: accounts.mint,
      isWritable: true,
      isSigner: false,
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
      pubkey: accounts.metadataProgram,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.tokenProgram ?? splToken.TOKEN_PROGRAM_ID,
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