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
 * @category Merge
 * @category generated
 */
export const mergeStruct = new beet.BeetArgsStruct<{
  instructionDiscriminator: number[] /* size: 8 */
}>(
  [['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)]],
  'MergeInstructionArgs',
)
/**
 * Accounts required by the _merge_ instruction
 *
 * @property [_writable_] destinationStake
 * @property [**signer**] authorized
 * @property [_writable_] sourceStake
 * @property [] zkpRequest
 * @property [] stakeProgram
 * @property [] clock
 * @property [] stakeHistory
 * @category Instructions
 * @category Merge
 * @category generated
 */
export type MergeInstructionAccounts = {
  destinationStake: web3.PublicKey
  authorized: web3.PublicKey
  sourceStake: web3.PublicKey
  zkpRequest: web3.PublicKey
  stakeProgram: web3.PublicKey
  clock: web3.PublicKey
  stakeHistory: web3.PublicKey
  anchorRemainingAccounts?: web3.AccountMeta[]
}

export const mergeInstructionDiscriminator = [
  148,
  141,
  236,
  47,
  174,
  126,
  69,
  111,
]

/**
 * Creates a _Merge_ instruction.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @category Instructions
 * @category Merge
 * @category generated
 */
export function createMergeInstruction(
  accounts: MergeInstructionAccounts,
  programId = new web3.PublicKey('CMev81L3acPrcTTevCFGdcNQnDypMGzuiAUgo8NBZJzr'),
) {
  const [data] = mergeStruct.serialize({
    instructionDiscriminator: mergeInstructionDiscriminator,
  })
  const keys: web3.AccountMeta[] = [
    {
      pubkey: accounts.destinationStake,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.authorized,
      isWritable: false,
      isSigner: true,
    },
    {
      pubkey: accounts.sourceStake,
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
      pubkey: accounts.clock,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.stakeHistory,
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
