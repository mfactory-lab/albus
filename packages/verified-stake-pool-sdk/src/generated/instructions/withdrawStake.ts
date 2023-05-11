/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as splToken from '@solana/spl-token'
import * as beet from '@metaplex-foundation/beet'
import * as web3 from '@solana/web3.js'

/**
 * @category Instructions
 * @category WithdrawStake
 * @category generated
 */
export type WithdrawStakeInstructionArgs = {
  amount: beet.bignum
}
/**
 * @category Instructions
 * @category WithdrawStake
 * @category generated
 */
export const withdrawStakeStruct = new beet.BeetArgsStruct<
  WithdrawStakeInstructionArgs & {
    instructionDiscriminator: number[] /* size: 8 */
  }
>(
  [
    ['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['amount', beet.u64],
  ],
  'WithdrawStakeInstructionArgs'
)
/**
 * Accounts required by the _withdrawStake_ instruction
 *
 * @property [] zkpRequest
 * @property [_writable_, **signer**] authority
 * @property [_writable_] stakePool
 * @property [_writable_] validatorListStorage
 * @property [] stakePoolWithdrawAuthority
 * @property [_writable_] stakeToSplit
 * @property [_writable_] stakeToReceive
 * @property [_writable_] poolTokensFrom
 * @property [_writable_] managerFeeAccount
 * @property [_writable_] poolMint
 * @property [] stakeProgram
 * @property [] clock
 * @category Instructions
 * @category WithdrawStake
 * @category generated
 */
export type WithdrawStakeInstructionAccounts = {
  zkpRequest: web3.PublicKey
  authority: web3.PublicKey
  stakePool: web3.PublicKey
  validatorListStorage: web3.PublicKey
  stakePoolWithdrawAuthority: web3.PublicKey
  stakeToSplit: web3.PublicKey
  stakeToReceive: web3.PublicKey
  poolTokensFrom: web3.PublicKey
  managerFeeAccount: web3.PublicKey
  poolMint: web3.PublicKey
  tokenProgram?: web3.PublicKey
  stakeProgram: web3.PublicKey
  clock: web3.PublicKey
  anchorRemainingAccounts?: web3.AccountMeta[]
}

export const withdrawStakeInstructionDiscriminator = [
  153, 8, 22, 138, 105, 176, 87, 66,
]

/**
 * Creates a _WithdrawStake_ instruction.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @param args to provide as instruction data to the program
 *
 * @category Instructions
 * @category WithdrawStake
 * @category generated
 */
export function createWithdrawStakeInstruction(
  accounts: WithdrawStakeInstructionAccounts,
  args: WithdrawStakeInstructionArgs,
  programId = new web3.PublicKey('HN5hBpR28T8Mjkm1CB1D8Hj5z5rHQ7VkD2ZWmZtFk49e')
) {
  const [data] = withdrawStakeStruct.serialize({
    instructionDiscriminator: withdrawStakeInstructionDiscriminator,
    ...args,
  })
  const keys: web3.AccountMeta[] = [
    {
      pubkey: accounts.zkpRequest,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.authority,
      isWritable: true,
      isSigner: true,
    },
    {
      pubkey: accounts.stakePool,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.validatorListStorage,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.stakePoolWithdrawAuthority,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.stakeToSplit,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.stakeToReceive,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.poolTokensFrom,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.managerFeeAccount,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.poolMint,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.tokenProgram ?? splToken.TOKEN_PROGRAM_ID,
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
