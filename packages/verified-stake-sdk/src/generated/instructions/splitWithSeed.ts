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
 * @category SplitWithSeed
 * @category generated
 */
export type SplitWithSeedInstructionArgs = {
  lamports: beet.bignum
  seed: string
}
/**
 * @category Instructions
 * @category SplitWithSeed
 * @category generated
 */
export const splitWithSeedStruct = new beet.FixableBeetArgsStruct<
  SplitWithSeedInstructionArgs & {
    instructionDiscriminator: number[] /* size: 8 */
  }
>(
  [
    ['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['lamports', beet.u64],
    ['seed', beet.utf8String],
  ],
  'SplitWithSeedInstructionArgs'
)
/**
 * Accounts required by the _splitWithSeed_ instruction
 *
 * @property [_writable_, **signer**] splitStake
 * @property [**signer**] authorized
 * @property [**signer**] base
 * @property [_writable_] stake
 * @property [] zkpRequest
 * @property [] stakeProgram
 * @category Instructions
 * @category SplitWithSeed
 * @category generated
 */
export type SplitWithSeedInstructionAccounts = {
  splitStake: web3.PublicKey
  authorized: web3.PublicKey
  base: web3.PublicKey
  stake: web3.PublicKey
  zkpRequest: web3.PublicKey
  stakeProgram: web3.PublicKey
  systemProgram?: web3.PublicKey
  anchorRemainingAccounts?: web3.AccountMeta[]
}

export const splitWithSeedInstructionDiscriminator = [
  87, 149, 132, 167, 56, 137, 2, 0,
]

/**
 * Creates a _SplitWithSeed_ instruction.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @param args to provide as instruction data to the program
 *
 * @category Instructions
 * @category SplitWithSeed
 * @category generated
 */
export function createSplitWithSeedInstruction(
  accounts: SplitWithSeedInstructionAccounts,
  args: SplitWithSeedInstructionArgs,
  programId = new web3.PublicKey('CMev81L3acPrcTTevCFGdcNQnDypMGzuiAUgo8NBZJzr')
) {
  const [data] = splitWithSeedStruct.serialize({
    instructionDiscriminator: splitWithSeedInstructionDiscriminator,
    ...args,
  })
  const keys: web3.AccountMeta[] = [
    {
      pubkey: accounts.splitStake,
      isWritable: true,
      isSigner: true,
    },
    {
      pubkey: accounts.authorized,
      isWritable: false,
      isSigner: true,
    },
    {
      pubkey: accounts.base,
      isWritable: false,
      isSigner: true,
    },
    {
      pubkey: accounts.stake,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.zkpRequest,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.stakeProgram,
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
