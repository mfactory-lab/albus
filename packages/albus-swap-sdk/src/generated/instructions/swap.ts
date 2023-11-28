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
  'SwapInstructionArgs',
)
/**
 * Accounts required by the _swap_ instruction
 *
 * @property [] proofRequest (optional)
 * @property [] tokenSwap
 * @property [] authority
 * @property [**signer**] userTransferAuthority
 * @property [_writable_] userSource
 * @property [_writable_] userDestination
 * @property [_writable_] poolSource
 * @property [_writable_] poolDestination
 * @property [_writable_] poolMint
 * @property [_writable_] poolFee
 * @property [] hostFeeAccount (optional)
 * @category Instructions
 * @category Swap
 * @category generated
 */
export type SwapInstructionAccounts = {
  proofRequest?: web3.PublicKey
  tokenSwap: web3.PublicKey
  authority: web3.PublicKey
  userTransferAuthority: web3.PublicKey
  userSource: web3.PublicKey
  userDestination: web3.PublicKey
  poolSource: web3.PublicKey
  poolDestination: web3.PublicKey
  poolMint: web3.PublicKey
  poolFee: web3.PublicKey
  hostFeeAccount?: web3.PublicKey
  tokenProgram?: web3.PublicKey
  anchorRemainingAccounts?: web3.AccountMeta[]
}

export const swapInstructionDiscriminator = [
  248,
  198,
  158,
  145,
  225,
  117,
  135,
  200,
]

/**
 * Creates a _Swap_ instruction.
 *
 * Optional accounts that are not provided default to the program ID since
 * this was indicated in the IDL from which this instruction was generated.
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
  programId = new web3.PublicKey('AsWaPFKSfQN7mJFzUVuJRmX2iEm2rMEvAX6NZAFvrUQM'),
) {
  const [data] = swapStruct.serialize({
    instructionDiscriminator: swapInstructionDiscriminator,
    ...args,
  })
  const keys: web3.AccountMeta[] = [
    {
      pubkey: accounts.proofRequest ?? programId,
      isWritable: false,
      isSigner: false,
    },
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
      pubkey: accounts.userSource,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.userDestination,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.poolSource,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.poolDestination,
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
      pubkey: accounts.hostFeeAccount ?? programId,
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
