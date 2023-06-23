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
 * @category Swap
 * @category generated
 */
export type SwapInstructionArgs = {
  amountIn: beet.bignum
  minimumAmountOut: beet.bignum
}
/**
 * @category Instructions
 * @category Swap
 * @category generated
 */
export const swapStruct = new beet.BeetArgsStruct<
  SwapInstructionArgs & {
    instructionDiscriminator: number[] /* size: 8 */
  }
>(
  [
    ['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['amountIn', beet.u64],
    ['minimumAmountOut', beet.u64],
  ],
  'SwapInstructionArgs'
)
/**
 * Accounts required by the _swap_ instruction
 *
 * @property [] swap
 * @property [] authority
 * @property [**signer**] userTransferAuthority
 * @property [_writable_] source
 * @property [_writable_] swapSource
 * @property [_writable_] swapDestination
 * @property [_writable_] destination
 * @property [_writable_] poolMint
 * @property [_writable_] poolFee
 * @property [] splTokenSwapProgram
 * @property [] proofRequest
 * @category Instructions
 * @category Swap
 * @category generated
 */
export type SwapInstructionAccounts = {
  swap: web3.PublicKey
  authority: web3.PublicKey
  userTransferAuthority: web3.PublicKey
  source: web3.PublicKey
  swapSource: web3.PublicKey
  swapDestination: web3.PublicKey
  destination: web3.PublicKey
  poolMint: web3.PublicKey
  poolFee: web3.PublicKey
  splTokenSwapProgram: web3.PublicKey
  proofRequest: web3.PublicKey
  tokenProgram?: web3.PublicKey
  anchorRemainingAccounts?: web3.AccountMeta[]
}

export const swapInstructionDiscriminator = [
  248, 198, 158, 145, 225, 117, 135, 200,
]

/**
 * Creates a _Swap_ instruction.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @param args to provide as instruction data to the program
 *
 * @category Instructions
 * @category Swap
 * @category generated
 */
export function createSwapInstruction(
  accounts: SwapInstructionAccounts,
  args: SwapInstructionArgs,
  programId = new web3.PublicKey('8NHcjkbgyuZzcwryaGJ9zf7JRqKfsHipuNDQdhtk9giR')
) {
  const [data] = swapStruct.serialize({
    instructionDiscriminator: swapInstructionDiscriminator,
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
      pubkey: accounts.source,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.swapSource,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.swapDestination,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.destination,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.poolMint,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.poolFee,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.splTokenSwapProgram,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.proofRequest,
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
