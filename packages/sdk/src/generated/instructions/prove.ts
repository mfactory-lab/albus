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
 * @category Prove
 * @category generated
 */
export const proveStruct = new beet.BeetArgsStruct<{
  instructionDiscriminator: number[] /* size: 8 */
}>(
  [['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)]],
  'ProveInstructionArgs',
)
/**
 * Accounts required by the _prove_ instruction
 *
 * @property [_writable_] zkpRequest
 * @property [] proofMetadata
 * @property [_writable_, **signer**] authority
 * @category Instructions
 * @category Prove
 * @category generated
 */
export interface ProveInstructionAccounts {
  zkpRequest: web3.PublicKey
  proofMetadata: web3.PublicKey
  authority: web3.PublicKey
  systemProgram?: web3.PublicKey
  anchorRemainingAccounts?: web3.AccountMeta[]
}

export const proveInstructionDiscriminator = [
  52, 246, 26, 161, 211, 170, 86, 215,
]

/**
 * Creates a _Prove_ instruction.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @category Instructions
 * @category Prove
 * @category generated
 */
export function createProveInstruction(
  accounts: ProveInstructionAccounts,
  programId = new web3.PublicKey('5dAMQUdhhsMwS8m7zVhKzVxiDNEHkTdCZ28dowCmVsj5'),
) {
  const [data] = proveStruct.serialize({
    instructionDiscriminator: proveInstructionDiscriminator,
  })
  const keys: web3.AccountMeta[] = [
    {
      pubkey: accounts.zkpRequest,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.proofMetadata,
      isWritable: false,
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
