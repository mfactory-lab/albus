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
 * @category Transfer
 * @category generated
 */
export type TransferInstructionArgs = {
  amount: beet.bignum
}
/**
 * @category Instructions
 * @category Transfer
 * @category generated
 */
export const transferStruct = new beet.BeetArgsStruct<
  TransferInstructionArgs & {
    instructionDiscriminator: number[] /* size: 8 */
  }
>(
  [
    ['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['amount', beet.u64],
  ],
  'TransferInstructionArgs'
)
/**
 * Accounts required by the _transfer_ instruction
 *
 * @property [_writable_, **signer**] sender
 * @property [_writable_] receiver
 * @property [] proofRequest
 * @category Instructions
 * @category Transfer
 * @category generated
 */
export type TransferInstructionAccounts = {
  sender: web3.PublicKey
  receiver: web3.PublicKey
  proofRequest: web3.PublicKey
  systemProgram?: web3.PublicKey
  anchorRemainingAccounts?: web3.AccountMeta[]
}

export const transferInstructionDiscriminator = [
  163, 52, 200, 231, 140, 3, 69, 186,
]

/**
 * Creates a _Transfer_ instruction.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @param args to provide as instruction data to the program
 *
 * @category Instructions
 * @category Transfer
 * @category generated
 */
export function createTransferInstruction(
  accounts: TransferInstructionAccounts,
  args: TransferInstructionArgs,
  programId = new web3.PublicKey('J4pyN7p9dAovEQKoZJV1jUbM3FrCBPLCS2dyiRUnwi5c')
) {
  const [data] = transferStruct.serialize({
    instructionDiscriminator: transferInstructionDiscriminator,
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
      pubkey: accounts.proofRequest,
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
