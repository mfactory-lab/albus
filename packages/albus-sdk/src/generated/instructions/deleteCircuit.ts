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
 * @category DeleteCircuit
 * @category generated
 */
export const deleteCircuitStruct = new beet.BeetArgsStruct<{
  instructionDiscriminator: number[] /* size: 8 */
}>(
  [['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)]],
  'DeleteCircuitInstructionArgs',
)
/**
 * Accounts required by the _deleteCircuit_ instruction
 *
 * @property [_writable_] circuit
 * @property [_writable_, **signer**] authority
 * @category Instructions
 * @category DeleteCircuit
 * @category generated
 */
export type DeleteCircuitInstructionAccounts = {
  circuit: web3.PublicKey
  authority: web3.PublicKey
  systemProgram?: web3.PublicKey
  anchorRemainingAccounts?: web3.AccountMeta[]
}

export const deleteCircuitInstructionDiscriminator = [
  40, 92, 89, 94, 54, 92, 39, 91,
]

/**
 * Creates a _DeleteCircuit_ instruction.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @category Instructions
 * @category DeleteCircuit
 * @category generated
 */
export function createDeleteCircuitInstruction(
  accounts: DeleteCircuitInstructionAccounts,
  programId = new web3.PublicKey('ALBUSbdydS2qoQXXeFfr4mqc9LFw5xWmUMdB4tcscHhi'),
) {
  const [data] = deleteCircuitStruct.serialize({
    instructionDiscriminator: deleteCircuitInstructionDiscriminator,
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
