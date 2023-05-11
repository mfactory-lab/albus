/*
 * This file is part of Albus code.
 *
 * Copyright (c) 2023, jFactory GmbH
 *
 * Albus is free software: you can redistribute it
 * and/or modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * Albus is distributed in the hope that it
 * will be useful, but WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.
 * If not, see <https://www.gnu.org/licenses/agpl-3.0.html>.
 *
 * You can be released from the requirements of the Affero GNU General Public License
 * by purchasing a commercial license. The purchase of such a license is
 * mandatory as soon as you develop commercial activities using the
 * Albus code without disclosing the source code of
 * your own applications.
 *
 * The developer of this program can be contacted at <info@jfactory.ch>.
 */

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
 * @category DeleteServiceProvider
 * @category generated
 */
export const deleteServiceProviderStruct = new beet.BeetArgsStruct<{
  instructionDiscriminator: number[] /* size: 8 */
}>(
  [['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)]],
  'DeleteServiceProviderInstructionArgs',
)
/**
 * Accounts required by the _deleteServiceProvider_ instruction
 *
 * @property [_writable_] serviceProvider
 * @property [_writable_, **signer**] authority
 * @category Instructions
 * @category DeleteServiceProvider
 * @category generated
 */
export interface DeleteServiceProviderInstructionAccounts {
  serviceProvider: web3.PublicKey
  authority: web3.PublicKey
  systemProgram?: web3.PublicKey
  anchorRemainingAccounts?: web3.AccountMeta[]
}

export const deleteServiceProviderInstructionDiscriminator = [
  186, 177, 156, 65, 168, 2, 56, 128,
]

/**
 * Creates a _DeleteServiceProvider_ instruction.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @category Instructions
 * @category DeleteServiceProvider
 * @category generated
 */
export function createDeleteServiceProviderInstruction(
  accounts: DeleteServiceProviderInstructionAccounts,
  programId = new web3.PublicKey('ALBUSePbQQtw6WavFNyALeyL4ekBADRE28PQJovDDZQz'),
) {
  const [data] = deleteServiceProviderStruct.serialize({
    instructionDiscriminator: deleteServiceProviderInstructionDiscriminator,
  })
  const keys: web3.AccountMeta[] = [
    {
      pubkey: accounts.serviceProvider,
      isWritable: true,
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
