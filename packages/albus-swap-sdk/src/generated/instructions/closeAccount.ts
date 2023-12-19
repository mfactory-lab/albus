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
 * @category CloseAccount
 * @category generated
 */
export const closeAccountStruct = new beet.BeetArgsStruct<{
  instructionDiscriminator: number[] /* size: 8 */
}>(
  [['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)]],
  'CloseAccountInstructionArgs',
)
/**
 * Accounts required by the _closeAccount_ instruction
 *
 * @property [_writable_] account
 * @property [_writable_, **signer**] authority
 * @category Instructions
 * @category CloseAccount
 * @category generated
 */
export type CloseAccountInstructionAccounts = {
  account: web3.PublicKey
  authority: web3.PublicKey
  systemProgram?: web3.PublicKey
  anchorRemainingAccounts?: web3.AccountMeta[]
}

export const closeAccountInstructionDiscriminator = [
  125, 255, 149, 14, 110, 34, 72, 24,
]

/**
 * Creates a _CloseAccount_ instruction.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @category Instructions
 * @category CloseAccount
 * @category generated
 */
export function createCloseAccountInstruction(
  accounts: CloseAccountInstructionAccounts,
  programId = new web3.PublicKey('ASWfaoztykN8Lz1P2uwuvwWR61SvFrvn6acM1sJpxKtq'),
) {
  const [data] = closeAccountStruct.serialize({
    instructionDiscriminator: closeAccountInstructionDiscriminator,
  })
  const keys: web3.AccountMeta[] = [
    {
      pubkey: accounts.account,
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
