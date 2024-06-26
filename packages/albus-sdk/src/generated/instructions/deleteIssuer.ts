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
 * @category DeleteIssuer
 * @category generated
 */
export const deleteIssuerStruct = new beet.BeetArgsStruct<{
  instructionDiscriminator: number[] /* size: 8 */
}>(
  [['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)]],
  'DeleteIssuerInstructionArgs',
)
/**
 * Accounts required by the _deleteIssuer_ instruction
 *
 * @property [_writable_] issuer
 * @property [_writable_, **signer**] authority
 * @category Instructions
 * @category DeleteIssuer
 * @category generated
 */
export type DeleteIssuerInstructionAccounts = {
  issuer: web3.PublicKey
  authority: web3.PublicKey
  systemProgram?: web3.PublicKey
  anchorRemainingAccounts?: web3.AccountMeta[]
}

export const deleteIssuerInstructionDiscriminator = [
  235, 96, 237, 30, 194, 248, 148, 231,
]

/**
 * Creates a _DeleteIssuer_ instruction.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @category Instructions
 * @category DeleteIssuer
 * @category generated
 */
export function createDeleteIssuerInstruction(
  accounts: DeleteIssuerInstructionAccounts,
  programId = new web3.PublicKey('ALBUSbdydS2qoQXXeFfr4mqc9LFw5xWmUMdB4tcscHhi'),
) {
  const [data] = deleteIssuerStruct.serialize({
    instructionDiscriminator: deleteIssuerInstructionDiscriminator,
  })
  const keys: web3.AccountMeta[] = [
    {
      pubkey: accounts.issuer,
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
