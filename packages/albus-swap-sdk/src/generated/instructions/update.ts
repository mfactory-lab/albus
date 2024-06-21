/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as web3 from '@solana/web3.js'
import * as beet from '@metaplex-foundation/beet'
import * as beetSolana from '@metaplex-foundation/beet-solana'

/**
 * @category Instructions
 * @category Update
 * @category generated
 */
export type UpdateInstructionArgs = {
  swapPolicy: beet.COption<web3.PublicKey>
  addLiquidityPolicy: beet.COption<web3.PublicKey>
}
/**
 * @category Instructions
 * @category Update
 * @category generated
 */
export const updateStruct = new beet.FixableBeetArgsStruct<
  UpdateInstructionArgs & {
    instructionDiscriminator: number[] /* size: 8 */
  }
>(
  [
    ['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['swapPolicy', beet.coption(beetSolana.publicKey)],
    ['addLiquidityPolicy', beet.coption(beetSolana.publicKey)],
  ],
  'UpdateInstructionArgs',
)
/**
 * Accounts required by the _update_ instruction
 *
 * @property [] authority
 * @property [_writable_] tokenSwap
 * @property [_writable_, **signer**] payer
 * @category Instructions
 * @category Update
 * @category generated
 */
export type UpdateInstructionAccounts = {
  authority: web3.PublicKey
  tokenSwap: web3.PublicKey
  payer: web3.PublicKey
  systemProgram?: web3.PublicKey
  anchorRemainingAccounts?: web3.AccountMeta[]
}

export const updateInstructionDiscriminator = [
  219, 200, 88, 176, 158, 63, 253, 127,
]

/**
 * Creates a _Update_ instruction.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @param args to provide as instruction data to the program
 *
 * @category Instructions
 * @category Update
 * @category generated
 */
export function createUpdateInstruction(
  accounts: UpdateInstructionAccounts,
  args: UpdateInstructionArgs,
  programId = new web3.PublicKey('ASWfaoztykN8Lz1P2uwuvwWR61SvFrvn6acM1sJpxKtq'),
) {
  const [data] = updateStruct.serialize({
    instructionDiscriminator: updateInstructionDiscriminator,
    ...args,
  })
  const keys: web3.AccountMeta[] = [
    {
      pubkey: accounts.authority,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.tokenSwap,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.payer,
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