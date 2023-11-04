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
 * @category DepositSingleTokenType
 * @category generated
 */
export interface DepositSingleTokenTypeInstructionArgs {
  sourceTokenAmount: beet.bignum
  minimumPoolTokenAmount: beet.bignum
}
/**
 * @category Instructions
 * @category DepositSingleTokenType
 * @category generated
 */
export const depositSingleTokenTypeStruct = new beet.BeetArgsStruct<
  DepositSingleTokenTypeInstructionArgs & {
    instructionDiscriminator: number[] /* size: 8 */
  }
>(
  [
    ['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['sourceTokenAmount', beet.u64],
    ['minimumPoolTokenAmount', beet.u64],
  ],
  'DepositSingleTokenTypeInstructionArgs',
)
/**
 * Accounts required by the _depositSingleTokenType_ instruction
 *
 * @property [] tokenSwap
 * @property [] authority
 * @property [**signer**] userTransferAuthority
 * @property [_writable_] source
 * @property [_writable_] swapTokenA
 * @property [_writable_] swapTokenB
 * @property [_writable_] poolMint
 * @property [_writable_] destination
 * @category Instructions
 * @category DepositSingleTokenType
 * @category generated
 */
export interface DepositSingleTokenTypeInstructionAccounts {
  tokenSwap: web3.PublicKey
  authority: web3.PublicKey
  userTransferAuthority: web3.PublicKey
  source: web3.PublicKey
  swapTokenA: web3.PublicKey
  swapTokenB: web3.PublicKey
  poolMint: web3.PublicKey
  destination: web3.PublicKey
  tokenProgram?: web3.PublicKey
  anchorRemainingAccounts?: web3.AccountMeta[]
}

export const depositSingleTokenTypeInstructionDiscriminator = [
  175, 0, 152, 41, 199, 0, 148, 43,
]

/**
 * Creates a _DepositSingleTokenType_ instruction.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @param args to provide as instruction data to the program
 *
 * @category Instructions
 * @category DepositSingleTokenType
 * @category generated
 */
export function createDepositSingleTokenTypeInstruction(
  accounts: DepositSingleTokenTypeInstructionAccounts,
  args: DepositSingleTokenTypeInstructionArgs,
  programId = new web3.PublicKey('J8YCNcS2xDvowMcSzWrDYNguk5y9NWfGStNT4YsiKuea'),
) {
  const [data] = depositSingleTokenTypeStruct.serialize({
    instructionDiscriminator: depositSingleTokenTypeInstructionDiscriminator,
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
      pubkey: accounts.poolMint,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.destination,
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
