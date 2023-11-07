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

import { readFileSync } from 'node:fs'
import { Metaplex, bundlrStorage, keypairIdentity } from '@metaplex-foundation/js'
import { AnchorProvider, Wallet } from '@coral-xyz/anchor'
import type { PublicKeyInitData } from '@solana/web3.js'
import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js'
import { assert } from 'vitest'
import type { AlbusClient, ProofRequestStatus } from '../../packages/albus-sdk'

export const payer = Keypair.fromSecretKey(Uint8Array.from([
  46, 183, 156, 94, 55, 128, 248, 0, 49, 70, 183, 244, 178, 0, 0, 236,
  212, 131, 76, 78, 112, 48, 25, 79, 249, 33, 43, 158, 199, 2, 168, 18,
  55, 174, 166, 159, 57, 67, 197, 158, 255, 142, 177, 177, 47, 39, 35, 185,
  148, 253, 191, 58, 219, 119, 104, 89, 225, 26, 244, 119, 160, 6, 156, 227,
]))

export const provider = newProvider(payer)

export function netMetaplex(payerKeypair: Keypair) {
  return Metaplex.make(provider.connection)
    .use(keypairIdentity(payerKeypair))
    .use(bundlrStorage({
      address: 'https://devnet.bundlr.network',
      providerUrl: provider.connection.rpcEndpoint,
      timeout: 60000,
    }))
}

export function newProvider(keypair: Keypair) {
  const opts = AnchorProvider.defaultOptions()
  return new AnchorProvider(
    new Connection('http://localhost:8899', opts),
    new Wallet(keypair),
    opts,
  )
}

export async function airdrop(addr: PublicKeyInitData, amount = 10) {
  await provider.connection.confirmTransaction(
    await provider.connection.requestAirdrop(new PublicKey(addr), amount * LAMPORTS_PER_SOL),
  )
}

export function assertErrorCode(error: { logs?: string[] }, code: string) {
  assert.ok(String((error?.logs ?? []).join('')).includes(`Error Code: ${code}`))
}

export function loadFixture(name: string) {
  return readFileSync(`./fixtures/${name}`)
}

export async function createTestProofRequest(client: AlbusClient, adminClient: AlbusClient, prefix: string, status: ProofRequestStatus) {
  const { address } = await client.proofRequest.create({
    serviceCode: `${prefix}_test`,
    policyCode: `${prefix}_test`,
  })
  await adminClient.proofRequest.changeStatus({ proofRequest: address, status })
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
