/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as web3 from '@solana/web3.js'
import * as beetSolana from '@metaplex-foundation/beet-solana'
import * as beet from '@metaplex-foundation/beet'
import { StakeAuthorize, stakeAuthorizeBeet } from '../types/StakeAuthorize'

/**
 * @category Instructions
 * @category Authorize
 * @category generated
 */
export type AuthorizeInstructionArgs = {
  newAuthorized: web3.PublicKey
  stakeAuthorize: StakeAuthorize
}
/**
 * @category Instructions
 * @category Authorize
 * @category generated
 */
export const authorizeStruct = new beet.BeetArgsStruct<
  AuthorizeInstructionArgs & {
    instructionDiscriminator: number[] /* size: 8 */
  }
>(
  [
    ['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['newAuthorized', beetSolana.publicKey],
    ['stakeAuthorize', stakeAuthorizeBeet],
  ],
  'AuthorizeInstructionArgs'
)
/**
 * Accounts required by the _authorize_ instruction
 *
 * @property [_writable_] stake
 * @property [**signer**] authorized
 * @property [] zkpRequest
 * @property [] stakeProgram
 * @property [] clock
 * @category Instructions
 * @category Authorize
 * @category generated
 */
export type AuthorizeInstructionAccounts = {
  stake: web3.PublicKey
  authorized: web3.PublicKey
  zkpRequest: web3.PublicKey
  stakeProgram: web3.PublicKey
  clock: web3.PublicKey
  anchorRemainingAccounts?: web3.AccountMeta[]
}

export const authorizeInstructionDiscriminator = [
  173, 193, 102, 210, 219, 137, 113, 120,
]

/**
 * Creates a _Authorize_ instruction.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @param args to provide as instruction data to the program
 *
 * @category Instructions
 * @category Authorize
 * @category generated
 */
export function createAuthorizeInstruction(
  accounts: AuthorizeInstructionAccounts,
  args: AuthorizeInstructionArgs,
  programId = new web3.PublicKey('CMev81L3acPrcTTevCFGdcNQnDypMGzuiAUgo8NBZJzr')
) {
  const [data] = authorizeStruct.serialize({
    instructionDiscriminator: authorizeInstructionDiscriminator,
    ...args,
  })
  const keys: web3.AccountMeta[] = [
    {
      pubkey: accounts.stake,
      isWritable: true,
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