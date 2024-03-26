/*
 * This file is part of Albus code.
 *
 * Copyright (c) 2023, mFactory GmbH
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
 * The developer of this program can be contacted at <info@albus.finance>.
 */

import { Metaplex, irysStorage, keypairIdentity } from '@metaplex-foundation/js'
import { AnchorProvider, Wallet } from '@coral-xyz/anchor'
import type { ConfirmOptions, PublicKeyInitData } from '@solana/web3.js'
import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js'
import { assert } from 'vitest'
import { ProofRequestStatus } from '../../packages/albus-sdk/src'
import type { AlbusClient } from '../../packages/albus-sdk/src'

export const payer = Keypair.fromSecretKey(Uint8Array.from([
  46, 183, 156, 94, 55, 128, 248, 0, 49, 70, 183, 244, 178, 0, 0, 236,
  212, 131, 76, 78, 112, 48, 25, 79, 249, 33, 43, 158, 199, 2, 168, 18,
  55, 174, 166, 159, 57, 67, 197, 158, 255, 142, 177, 177, 47, 39, 35, 185,
  148, 253, 191, 58, 219, 119, 104, 89, 225, 26, 244, 119, 160, 6, 156, 227,
]))

export const provider = initProvider(payer)

/**
 * Initializes a Metaplex instance with the given payer keypair.
 */
export function initMetaplex(payerKeypair: Keypair) {
  return Metaplex.make(provider.connection)
    .use(keypairIdentity(payerKeypair))
    .use(irysStorage({
      address: 'https://devnet.irys.xyz',
      providerUrl: provider.connection.rpcEndpoint,
      timeout: 60000,
    }))
}

/**
 * Initializes the provider with the given keypair and options.
 */
export function initProvider(keypair: Keypair, opts?: ConfirmOptions) {
  opts = {
    ...opts,
    skipPreflight: true,
    commitment: 'confirmed',
    preflightCommitment: 'confirmed',
  }
  return new AnchorProvider(
    new Connection('http://127.0.0.1:8899', opts),
    new Wallet(keypair),
    {
      ...AnchorProvider.defaultOptions(),
      ...opts,
    },
  )
}

/**
 * Requests an airdrop of a specified amount of SOL to the given public key address.
 */
export async function requestAirdrop(addr: PublicKeyInitData, amount = 100) {
  const { connection } = provider
  const signature = await connection.requestAirdrop(new PublicKey(addr), amount * LAMPORTS_PER_SOL)
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash()
  await connection.confirmTransaction({ blockhash, lastValidBlockHeight, signature })
}

/**
 * Sleeps for a specified amount of time.
 */
export const sleep = (delay: number) => new Promise(resolve => setTimeout(resolve, delay))

/**
 * Asserts that the error message contains the specified message.
 */
export function assertErrorMessage(error: { logs?: string[] }, msg: string) {
  assert.ok(String((error?.logs ?? []).join('')).includes(msg))
}

/**
 * Asserts that the given error object has the specified error code.
 */
export function assertErrorCode(error: { logs?: string[] }, code: string) {
  assertErrorMessage(error, `Error Code: ${code}`)
}

export async function createTestProofRequest(client: AlbusClient, adminClient: AlbusClient, prefix: string, status?: ProofRequestStatus) {
  const { address } = await client.proofRequest.create({
    serviceCode: `${prefix}_test`,
    policyCode: `${prefix}_test`,
  })
  await adminClient.proofRequest.changeStatus({ proofRequest: address, status: status ?? ProofRequestStatus.Verified })
  return address
}

export async function createTestData(client: AlbusClient, prefix: string) {
  const circuitCode = `${prefix}_test`
  const serviceCode = `${prefix}_test`
  const policyCode = `${prefix}_test`

  const { address: circuit } = await client.circuit.create({
    code: circuitCode,
    name: circuitCode,
    wasmUri: '',
    zkeyUri: '',
    outputs: [],
    privateSignals: [],
    publicSignals: [],
  })

  const { address: service } = await client.service.create({ code: serviceCode, name: serviceCode })

  const { address: policy } = await client.policy.create({
    code: policyCode,
    serviceCode,
    circuitCode,
    name: policyCode,
    description: '',
    expirationPeriod: 0,
    retentionPeriod: 0,
    rules: [],
  })

  return {
    circuit,
    circuitCode,
    service,
    serviceCode,
    policy,
    policyCode,
  }
}

export async function deleteTestData(client: AlbusClient, prefix: string) {
  const circuitCode = `${prefix}_test`
  const serviceCode = `${prefix}_test`
  const policyCode = `${prefix}_test`
  await client.policy.delete({ serviceCode, code: policyCode })
  await client.service.delete({ code: serviceCode })
  await client.circuit.delete({ code: circuitCode })
}
