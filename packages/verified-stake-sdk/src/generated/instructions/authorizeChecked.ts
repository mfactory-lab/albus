/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as beet from '@metaplex-foundation/beet'
import * as web3 from '@solana/web3.js'
import type { StakeAuthorize } from '../types/StakeAuthorize'
import { stakeAuthorizeBeet } from '../types/StakeAuthorize'

/**
 * @category Instructions
 * @category AuthorizeChecked
 * @category generated
 */
export interface AuthorizeCheckedInstructionArgs {
  stakeAuthorize: StakeAuthorize
}
/**
 * @category Instructions
 * @category AuthorizeChecked
 * @category generated
 */
export const authorizeCheckedStruct = new beet.BeetArgsStruct<
  AuthorizeCheckedInstructionArgs & {
    instructionDiscriminator: number[] /* size: 8 */
  }
>(
  [
    ['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['stakeAuthorize', stakeAuthorizeBeet],
  ],
  'AuthorizeCheckedInstructionArgs',
)
/**
 * Accounts required by the _authorizeChecked_ instruction
 *
 * @property [_writable_] stake
 * @property [**signer**] newAuthorized
 * @property [**signer**] authorized
 * @property [] zkpRequest
 * @property [] stakeProgram
 * @property [] clock
 * @category Instructions
 * @category AuthorizeChecked
 * @category generated
 */
export interface AuthorizeCheckedInstructionAccounts {
  stake: web3.PublicKey
  newAuthorized: web3.PublicKey
  authorized: web3.PublicKey
  zkpRequest: web3.PublicKey
  stakeProgram: web3.PublicKey
  clock: web3.PublicKey
  anchorRemainingAccounts?: web3.AccountMeta[]
}

export const authorizeCheckedInstructionDiscriminator = [
  147, 97, 67, 26, 230, 107, 45, 242,
]

/**
 * Creates a _AuthorizeChecked_ instruction.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @param args to provide as instruction data to the program
 *
 * @category Instructions
 * @category AuthorizeChecked
 * @category generated
 */
export function createAuthorizeCheckedInstruction(
  accounts: AuthorizeCheckedInstructionAccounts,
  args: AuthorizeCheckedInstructionArgs,
  programId = new web3.PublicKey('CMev81L3acPrcTTevCFGdcNQnDypMGzuiAUgo8NBZJzr'),
) {
  const [data] = authorizeCheckedStruct.serialize({
    instructionDiscriminator: authorizeCheckedInstructionDiscriminator,
    ...args,
  })
  const keys: web3.AccountMeta[] = [
    {
      pubkey: accounts.stake,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.newAuthorized,
      isWritable: false,
      isSigner: true,
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
