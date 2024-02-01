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
 * @category WithdrawSingleTokenType
 * @category generated
 */
export type WithdrawSingleTokenTypeInstructionArgs = {
  destinationTokenAmount: beet.bignum
  maximumPoolTokenAmount: beet.bignum
}
/**
 * @category Instructions
 * @category WithdrawSingleTokenType
 * @category generated
 */
export const withdrawSingleTokenTypeStruct = new beet.BeetArgsStruct<
  WithdrawSingleTokenTypeInstructionArgs & {
    instructionDiscriminator: number[] /* size: 8 */
  }
>(
  [
    ['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['destinationTokenAmount', beet.u64],
    ['maximumPoolTokenAmount', beet.u64],
  ],
  'WithdrawSingleTokenTypeInstructionArgs'
)
/**
 * Accounts required by the _withdrawSingleTokenType_ instruction
 *
 * @property [] tokenSwap
 * @property [] authority
 * @property [**signer**] userTransferAuthority
 * @property [_writable_] poolMint
 * @property [_writable_] source
 * @property [_writable_] swapTokenA
 * @property [_writable_] swapTokenB
 * @property [_writable_] destination
 * @property [_writable_] poolFee
 * @category Instructions
 * @category WithdrawSingleTokenType
 * @category generated
 */
export type WithdrawSingleTokenTypeInstructionAccounts = {
  tokenSwap: web3.PublicKey
  authority: web3.PublicKey
  userTransferAuthority: web3.PublicKey
  poolMint: web3.PublicKey
  source: web3.PublicKey
  swapTokenA: web3.PublicKey
  swapTokenB: web3.PublicKey
  destination: web3.PublicKey
  poolFee: web3.PublicKey
  tokenProgram?: web3.PublicKey
  anchorRemainingAccounts?: web3.AccountMeta[]
}

export const withdrawSingleTokenTypeInstructionDiscriminator = [
  111, 171, 21, 77, 237, 181, 241, 56,
]

/**
 * Creates a _WithdrawSingleTokenType_ instruction.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @param args to provide as instruction data to the program
 *
 * @category Instructions
 * @category WithdrawSingleTokenType
 * @category generated
 */
export function createWithdrawSingleTokenTypeInstruction(
  accounts: WithdrawSingleTokenTypeInstructionAccounts,
  args: WithdrawSingleTokenTypeInstructionArgs,
  programId = new web3.PublicKey('ASWfaoztykN8Lz1P2uwuvwWR61SvFrvn6acM1sJpxKtq')
) {
  const [data] = withdrawSingleTokenTypeStruct.serialize({
    instructionDiscriminator: withdrawSingleTokenTypeInstructionDiscriminator,
    ...args,
  })
  const keys: web3.AccountMeta[] = [
    {
      pubkey: accounts.tokenSwap,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.authority,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.userTransferAuthority,
      isWritable: false,
      isSigner: true,
    },
    {
      pubkey: accounts.poolMint,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.source,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.swapTokenA,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.swapTokenB,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.destination,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.poolFee,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.tokenProgram ?? splToken.TOKEN_PROGRAM_ID,
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
