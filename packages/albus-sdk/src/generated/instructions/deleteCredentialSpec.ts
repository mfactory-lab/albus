/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as beet from '@metaplex-foundation/beet'
import * as web3 from '@solana/web3.js'

/**
 * @category Instructions
 * @category DeleteCredentialSpec
 * @category generated
 */
export const deleteCredentialSpecStruct = new beet.BeetArgsStruct<{
  instructionDiscriminator: number[] /* size: 8 */
}>(
  [['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)]],
  'DeleteCredentialSpecInstructionArgs',
)
/**
 * Accounts required by the _deleteCredentialSpec_ instruction
 *
 * @property [_writable_] credentialSpec
 * @property [_writable_, **signer**] authority
 * @property [] issuer
 * @category Instructions
 * @category DeleteCredentialSpec
 * @category generated
 */
export type DeleteCredentialSpecInstructionAccounts = {
  credentialSpec: web3.PublicKey
  authority: web3.PublicKey
  issuer: web3.PublicKey
  systemProgram?: web3.PublicKey
  anchorRemainingAccounts?: web3.AccountMeta[]
}

export const deleteCredentialSpecInstructionDiscriminator = [
  200, 37, 111, 173, 110, 246, 89, 216,
]

/**
 * Creates a _DeleteCredentialSpec_ instruction.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @category Instructions
 * @category DeleteCredentialSpec
 * @category generated
 */
export function createDeleteCredentialSpecInstruction(
  accounts: DeleteCredentialSpecInstructionAccounts,
  programId = new web3.PublicKey('ALBUSbdydS2qoQXXeFfr4mqc9LFw5xWmUMdB4tcscHhi'),
) {
  const [data] = deleteCredentialSpecStruct.serialize({
    instructionDiscriminator: deleteCredentialSpecInstructionDiscriminator,
  })
  const keys: web3.AccountMeta[] = [
    {
      pubkey: accounts.credentialSpec,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.authority,
      isWritable: true,
      isSigner: true,
    },
    {
      pubkey: accounts.issuer,
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