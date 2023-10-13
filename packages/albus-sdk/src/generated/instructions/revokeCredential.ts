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
 * @category RevokeCredential
 * @category generated
 */
export const revokeCredentialStruct = new beet.BeetArgsStruct<{
  instructionDiscriminator: number[] /* size: 8 */
}>(
  [['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)]],
  'RevokeCredentialInstructionArgs',
)
/**
 * Accounts required by the _revokeCredential_ instruction
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
 * @category RevokeCredential
 * @category generated
 */
export interface RevokeCredentialInstructionAccounts {
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

export const revokeCredentialInstructionDiscriminator = [
  38, 123, 95, 95, 223, 158, 169, 87,
]

/**
 * Creates a _RevokeCredential_ instruction.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @category Instructions
 * @category RevokeCredential
 * @category generated
 */
export function createRevokeCredentialInstruction(
  accounts: RevokeCredentialInstructionAccounts,
  programId = new web3.PublicKey('ALBs64hsiHgdg53mvd4bcvNZLfDRhctSVaP7PwAPpsZL'),
) {
  const [data] = revokeCredentialStruct.serialize({
    instructionDiscriminator: revokeCredentialInstructionDiscriminator,
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