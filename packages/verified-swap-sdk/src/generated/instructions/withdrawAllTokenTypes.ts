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
 * @category WithdrawAllTokenTypes
 * @category generated
 */
export interface WithdrawAllTokenTypesInstructionArgs {
  poolTokenAmount: beet.bignum
  minimumTokenAAmount: beet.bignum
  minimumTokenBAmount: beet.bignum
}
/**
 * @category Instructions
 * @category WithdrawAllTokenTypes
 * @category generated
 */
export const withdrawAllTokenTypesStruct = new beet.BeetArgsStruct<
  WithdrawAllTokenTypesInstructionArgs & {
    instructionDiscriminator: number[] /* size: 8 */
  }
>(
  [
    ['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['poolTokenAmount', beet.u64],
    ['minimumTokenAAmount', beet.u64],
    ['minimumTokenBAmount', beet.u64],
  ],
  'WithdrawAllTokenTypesInstructionArgs',
)
/**
 * Accounts required by the _withdrawAllTokenTypes_ instruction
 *
 * @property [] swap
 * @property [] authority
 * @property [**signer**] userTransferAuthority
 * @property [_writable_] destinationTokenA
 * @property [_writable_] destinationTokenB
 * @property [_writable_] swapTokenA
 * @property [_writable_] swapTokenB
 * @property [_writable_] poolMint
 * @property [_writable_] source
 * @property [_writable_] feeAccount
 * @property [] splTokenSwapProgram
 * @property [] zkpRequest
 * @category Instructions
 * @category WithdrawAllTokenTypes
 * @category generated
 */
export interface WithdrawAllTokenTypesInstructionAccounts {
  swap: web3.PublicKey
  authority: web3.PublicKey
  userTransferAuthority: web3.PublicKey
  destinationTokenA: web3.PublicKey
  destinationTokenB: web3.PublicKey
  swapTokenA: web3.PublicKey
  swapTokenB: web3.PublicKey
  poolMint: web3.PublicKey
  source: web3.PublicKey
  feeAccount: web3.PublicKey
  splTokenSwapProgram: web3.PublicKey
  zkpRequest: web3.PublicKey
  tokenProgram?: web3.PublicKey
  anchorRemainingAccounts?: web3.AccountMeta[]
}

export const withdrawAllTokenTypesInstructionDiscriminator = [
  189, 254, 156, 174, 210, 9, 164, 216,
]

/**
 * Creates a _WithdrawAllTokenTypes_ instruction.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @param args to provide as instruction data to the program
 *
 * @category Instructions
 * @category WithdrawAllTokenTypes
 * @category generated
 */
export function createWithdrawAllTokenTypesInstruction(
  accounts: WithdrawAllTokenTypesInstructionAccounts,
  args: WithdrawAllTokenTypesInstructionArgs,
  programId = new web3.PublicKey('8NHcjkbgyuZzcwryaGJ9zf7JRqKfsHipuNDQdhtk9giR'),
) {
  const [data] = withdrawAllTokenTypesStruct.serialize({
    instructionDiscriminator: withdrawAllTokenTypesInstructionDiscriminator,
    ...args,
  })
  const keys: web3.AccountMeta[] = [
    {
      pubkey: accounts.swap,
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
      pubkey: accounts.destinationTokenA,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.destinationTokenB,
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
      pubkey: accounts.feeAccount,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.splTokenSwapProgram,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.zkpRequest,
      isWritable: false,
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
