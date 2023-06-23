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
 * @category SplTransfer
 * @category generated
 */
export interface SplTransferInstructionArgs {
  amount: beet.bignum
}
/**
 * @category Instructions
 * @category SplTransfer
 * @category generated
 */
export const splTransferStruct = new beet.BeetArgsStruct<
  SplTransferInstructionArgs & {
    instructionDiscriminator: number[] /* size: 8 */
  }
>(
  [
    ['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['amount', beet.u64],
  ],
  'SplTransferInstructionArgs',
)
/**
 * Accounts required by the _splTransfer_ instruction
 *
 * @property [_writable_, **signer**] sender
 * @property [_writable_] receiver
 * @property [] tokenMint
 * @property [_writable_] source
 * @property [_writable_] destination
 * @property [] proofRequest
 * @category Instructions
 * @category SplTransfer
 * @category generated
 */
export interface SplTransferInstructionAccounts {
  sender: web3.PublicKey
  receiver: web3.PublicKey
  tokenMint: web3.PublicKey
  source: web3.PublicKey
  destination: web3.PublicKey
  proofRequest: web3.PublicKey
  tokenProgram?: web3.PublicKey
  systemProgram?: web3.PublicKey
  anchorRemainingAccounts?: web3.AccountMeta[]
}

export const splTransferInstructionDiscriminator = [
  67, 186, 237, 99, 235, 243, 166, 198,
]

/**
 * Creates a _SplTransfer_ instruction.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @param args to provide as instruction data to the program
 *
 * @category Instructions
 * @category SplTransfer
 * @category generated
 */
export function createSplTransferInstruction(
  accounts: SplTransferInstructionAccounts,
  args: SplTransferInstructionArgs,
  programId = new web3.PublicKey('ChfXD6UnExK5ihM1LJcnNGVJekVtHWms5cJu47pH9Fe2'),
) {
  const [data] = splTransferStruct.serialize({
    instructionDiscriminator: splTransferInstructionDiscriminator,
    ...args,
  })
  const keys: web3.AccountMeta[] = [
    {
      pubkey: accounts.sender,
      isWritable: true,
      isSigner: true,
    },
    {
      pubkey: accounts.receiver,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.tokenMint,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.source,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.destination,
      isWritable: true,
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
    {
      pubkey: accounts.systemProgram ?? web3.SystemProgram.programId,
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
