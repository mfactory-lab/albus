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
 * @category Redelegate
 * @category generated
 */
export const redelegateStruct = new beet.BeetArgsStruct<{
  instructionDiscriminator: number[] /* size: 8 */
}>(
  [['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)]],
  'RedelegateInstructionArgs'
)
/**
 * Accounts required by the _redelegate_ instruction
 *
 * @property [_writable_, **signer**] uninitializedStake
 * @property [_writable_] stake
 * @property [] vote
 * @property [**signer**] authorized
 * @property [] zkpRequest
 * @property [] stakeProgram
 * @property [] stakeConfig
 * @category Instructions
 * @category Redelegate
 * @category generated
 */
export type RedelegateInstructionAccounts = {
  uninitializedStake: web3.PublicKey
  stake: web3.PublicKey
  vote: web3.PublicKey
  authorized: web3.PublicKey
  zkpRequest: web3.PublicKey
  stakeProgram: web3.PublicKey
  systemProgram?: web3.PublicKey
  stakeConfig: web3.PublicKey
  anchorRemainingAccounts?: web3.AccountMeta[]
}

export const redelegateInstructionDiscriminator = [
  212, 82, 51, 160, 228, 80, 116, 35,
]

/**
 * Creates a _Redelegate_ instruction.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @category Instructions
 * @category Redelegate
 * @category generated
 */
export function createRedelegateInstruction(
  accounts: RedelegateInstructionAccounts,
  programId = new web3.PublicKey('CMev81L3acPrcTTevCFGdcNQnDypMGzuiAUgo8NBZJzr')
) {
  const [data] = redelegateStruct.serialize({
    instructionDiscriminator: redelegateInstructionDiscriminator,
  })
  const keys: web3.AccountMeta[] = [
    {
      pubkey: accounts.uninitializedStake,
      isWritable: true,
      isSigner: true,
    },
    {
      pubkey: accounts.stake,
      isWritable: true,
      isSigner: false,
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
