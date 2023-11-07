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
 * @category RedelegateWithSeed
 * @category generated
 */
export type RedelegateWithSeedInstructionArgs = {
  seed: string
}
/**
 * @category Instructions
 * @category RedelegateWithSeed
 * @category generated
 */
export const redelegateWithSeedStruct = new beet.FixableBeetArgsStruct<
  RedelegateWithSeedInstructionArgs & {
    instructionDiscriminator: number[] /* size: 8 */
  }
>(
  [
    ['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['seed', beet.utf8String],
  ],
  'RedelegateWithSeedInstructionArgs',
)
/**
 * Accounts required by the _redelegateWithSeed_ instruction
 *
 * @property [_writable_] uninitializedStake
 * @property [_writable_] stake
 * @property [**signer**] base
 * @property [] vote
 * @property [**signer**] authorized
 * @property [] zkpRequest
 * @property [] stakeProgram
 * @property [] stakeConfig
 * @category Instructions
 * @category RedelegateWithSeed
 * @category generated
 */
export type RedelegateWithSeedInstructionAccounts = {
  uninitializedStake: web3.PublicKey
  stake: web3.PublicKey
  base: web3.PublicKey
  vote: web3.PublicKey
  authorized: web3.PublicKey
  zkpRequest: web3.PublicKey
  stakeProgram: web3.PublicKey
  systemProgram?: web3.PublicKey
  stakeConfig: web3.PublicKey
  anchorRemainingAccounts?: web3.AccountMeta[]
}

export const redelegateWithSeedInstructionDiscriminator = [
  202,
  113,
  55,
  187,
  154,
  141,
  28,
  164,
]

/**
 * Creates a _RedelegateWithSeed_ instruction.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @param args to provide as instruction data to the program
 *
 * @category Instructions
 * @category RedelegateWithSeed
 * @category generated
 */
export function createRedelegateWithSeedInstruction(
  accounts: RedelegateWithSeedInstructionAccounts,
  args: RedelegateWithSeedInstructionArgs,
  programId = new web3.PublicKey('CMev81L3acPrcTTevCFGdcNQnDypMGzuiAUgo8NBZJzr'),
) {
  const [data] = redelegateWithSeedStruct.serialize({
    instructionDiscriminator: redelegateWithSeedInstructionDiscriminator,
    ...args,
  })
  const keys: web3.AccountMeta[] = [
    {
      pubkey: accounts.uninitializedStake,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.stake,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.base,
      isWritable: false,
      isSigner: true,
    },
    {
      pubkey: accounts.vote,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.authorized,
      isWritable: false,
      isSigner: true,
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
    {
      pubkey: accounts.stakeConfig,
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
