/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as splToken from '@solana/spl-token'
import * as beet from '@metaplex-foundation/beet'
import * as web3 from '@solana/web3.js'
import type { FeesInfo } from '../types/FeesInfo'
import { feesInfoBeet } from '../types/FeesInfo'
import type { CurveInfo } from '../types/CurveInfo'
import { curveInfoBeet } from '../types/CurveInfo'

/**
 * @category Instructions
 * @category Initialize
 * @category generated
 */
export interface InitializeInstructionArgs {
  feesInput: FeesInfo
  curveInput: CurveInfo
}
/**
 * @category Instructions
 * @category Initialize
 * @category generated
 */
export const initializeStruct = new beet.BeetArgsStruct<
  InitializeInstructionArgs & {
    instructionDiscriminator: number[] /* size: 8 */
  }
>(
  [
    ['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['feesInput', feesInfoBeet],
    ['curveInput', curveInfoBeet],
  ],
  'InitializeInstructionArgs',
)
/**
 * Accounts required by the _initialize_ instruction
 *
 * @property [] authority
 * @property [_writable_, **signer**] tokenSwap
 * @property [_writable_] poolMint
 * @property [_writable_] tokenA
 * @property [_writable_] tokenB
 * @property [_writable_] poolFee
 * @property [_writable_] destination
 * @category Instructions
 * @category Initialize
 * @category generated
 */
export interface InitializeInstructionAccounts {
  authority: web3.PublicKey
  tokenSwap: web3.PublicKey
  poolMint: web3.PublicKey
  tokenA: web3.PublicKey
  tokenB: web3.PublicKey
  poolFee: web3.PublicKey
  destination: web3.PublicKey
  tokenProgram?: web3.PublicKey
  anchorRemainingAccounts?: web3.AccountMeta[]
}

export const initializeInstructionDiscriminator = [
  175, 175, 109, 31, 13, 152, 155, 237,
]

/**
 * Creates a _Initialize_ instruction.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @param args to provide as instruction data to the program
 *
 * @category Instructions
 * @category Initialize
 * @category generated
 */
export function createInitializeInstruction(
  accounts: InitializeInstructionAccounts,
  args: InitializeInstructionArgs,
  programId = new web3.PublicKey('J8YCNcS2xDvowMcSzWrDYNguk5y9NWfGStNT4YsiKuea'),
) {
  const [data] = initializeStruct.serialize({
    instructionDiscriminator: initializeInstructionDiscriminator,
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
      isSigner: true,
    },
    {
      pubkey: accounts.poolMint,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.tokenA,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.tokenB,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.poolFee,
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
