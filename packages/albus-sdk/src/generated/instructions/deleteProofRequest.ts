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
 * @category DeleteProofRequest
 * @category generated
 */
export const deleteProofRequestStruct = new beet.BeetArgsStruct<{
  instructionDiscriminator: number[] /* size: 8 */
}>(
  [['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)]],
  'DeleteProofRequestInstructionArgs',
)
/**
 * Accounts required by the _deleteProofRequest_ instruction
 *
 * @property [_writable_] proofRequest
 * @property [_writable_, **signer**] authority
 * @category Instructions
 * @category DeleteProofRequest
 * @category generated
 */
export type DeleteProofRequestInstructionAccounts = {
  proofRequest: web3.PublicKey
  authority: web3.PublicKey
  systemProgram?: web3.PublicKey
  anchorRemainingAccounts?: web3.AccountMeta[]
}

export const deleteProofRequestInstructionDiscriminator = [
  34,
  9,
  125,
  78,
  113,
  197,
  126,
  34,
]

/**
 * Creates a _DeleteProofRequest_ instruction.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @category Instructions
 * @category DeleteProofRequest
 * @category generated
 */
export function createDeleteProofRequestInstruction(
  accounts: DeleteProofRequestInstructionAccounts,
  programId = new web3.PublicKey('ALBs64hsiHgdg53mvd4bcvNZLfDRhctSVaP7PwAPpsZL'),
) {
  const [data] = deleteProofRequestStruct.serialize({
    instructionDiscriminator: deleteProofRequestInstructionDiscriminator,
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
