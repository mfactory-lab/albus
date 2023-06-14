/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as beet from '@metaplex-foundation/beet'
import * as web3 from '@solana/web3.js'
import type { CreateProofRequestData } from '../types/CreateProofRequestData'
import {
  createProofRequestDataBeet,
} from '../types/CreateProofRequestData'

/**
 * @category Instructions
 * @category CreateProofRequest
 * @category generated
 */
export interface CreateProofRequestInstructionArgs {
  data: CreateProofRequestData
}
/**
 * @category Instructions
 * @category CreateProofRequest
 * @category generated
 */
export const createProofRequestStruct = new beet.BeetArgsStruct<
  CreateProofRequestInstructionArgs & {
    instructionDiscriminator: number[] /* size: 8 */
  }
>(
  [
    ['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['data', createProofRequestDataBeet],
  ],
  'CreateProofRequestInstructionArgs',
)
/**
 * Accounts required by the _createProofRequest_ instruction
 *
 * @property [_writable_] serviceProvider
 * @property [_writable_] proofRequest
 * @property [] circuitMint
 * @property [] circuitMetadata
 * @property [_writable_, **signer**] authority
 * @category Instructions
 * @category CreateProofRequest
 * @category generated
 */
export interface CreateProofRequestInstructionAccounts {
  serviceProvider: web3.PublicKey
  proofRequest: web3.PublicKey
  circuitMint: web3.PublicKey
  circuitMetadata: web3.PublicKey
  authority: web3.PublicKey
  systemProgram?: web3.PublicKey
  anchorRemainingAccounts?: web3.AccountMeta[]
}

export const createProofRequestInstructionDiscriminator = [
  18, 176, 14, 175, 218, 24, 32, 130,
]

/**
 * Creates a _CreateProofRequest_ instruction.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @param args to provide as instruction data to the program
 *
 * @category Instructions
 * @category CreateProofRequest
 * @category generated
 */
export function createCreateProofRequestInstruction(
  accounts: CreateProofRequestInstructionAccounts,
  args: CreateProofRequestInstructionArgs,
  programId = new web3.PublicKey('ALBUSePbQQtw6WavFNyALeyL4ekBADRE28PQJovDDZQz'),
) {
  const [data] = createProofRequestStruct.serialize({
    instructionDiscriminator: createProofRequestInstructionDiscriminator,
    ...args,
  })
  const keys: web3.AccountMeta[] = [
    {
      pubkey: accounts.serviceProvider,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.proofRequest,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.circuitMint,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.circuitMetadata,
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
