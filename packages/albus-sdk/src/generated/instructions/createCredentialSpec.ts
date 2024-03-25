/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as beet from '@metaplex-foundation/beet'
import * as web3 from '@solana/web3.js'
import type {
  CreateCredentialSpecData } from '../types/CreateCredentialSpecData'
import {
  createCredentialSpecDataBeet,
} from '../types/CreateCredentialSpecData'

/**
 * @category Instructions
 * @category CreateCredentialSpec
 * @category generated
 */
export type CreateCredentialSpecInstructionArgs = {
  data: CreateCredentialSpecData
}
/**
 * @category Instructions
 * @category CreateCredentialSpec
 * @category generated
 */
export const createCredentialSpecStruct = new beet.FixableBeetArgsStruct<
  CreateCredentialSpecInstructionArgs & {
    instructionDiscriminator: number[] /* size: 8 */
  }
>(
  [
    ['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['data', createCredentialSpecDataBeet],
  ],
  'CreateCredentialSpecInstructionArgs',
)
/**
 * Accounts required by the _createCredentialSpec_ instruction
 *
 * @property [_writable_] credentialSpec
 * @property [] issuer
 * @property [_writable_, **signer**] authority
 * @category Instructions
 * @category CreateCredentialSpec
 * @category generated
 */
export type CreateCredentialSpecInstructionAccounts = {
  credentialSpec: web3.PublicKey
  issuer: web3.PublicKey
  authority: web3.PublicKey
  systemProgram?: web3.PublicKey
  anchorRemainingAccounts?: web3.AccountMeta[]
}

export const createCredentialSpecInstructionDiscriminator = [
  102, 192, 238, 168, 226, 244, 45, 185,
]

/**
 * Creates a _CreateCredentialSpec_ instruction.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @param args to provide as instruction data to the program
 *
 * @category Instructions
 * @category CreateCredentialSpec
 * @category generated
 */
export function createCreateCredentialSpecInstruction(
  accounts: CreateCredentialSpecInstructionAccounts,
  args: CreateCredentialSpecInstructionArgs,
  programId = new web3.PublicKey('ALBUSbdydS2qoQXXeFfr4mqc9LFw5xWmUMdB4tcscHhi'),
) {
  const [data] = createCredentialSpecStruct.serialize({
    instructionDiscriminator: createCredentialSpecInstructionDiscriminator,
    ...args,
  })
  const keys: web3.AccountMeta[] = [
    {
      pubkey: accounts.credentialSpec,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.issuer,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.authority,
      isWritable: true,
      isSigner: true,
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