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

import { BN } from '@coral-xyz/anchor'
import { createMint, getOrCreateAssociatedTokenAccount, mintTo } from '@solana/spl-token'
import type { PublicKey } from '@solana/web3.js'
import { Keypair, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { beforeAll, describe, it } from 'vitest'
import { AlbusClient } from '../../packages/albus-sdk/src'
import { AlbusTransferClient } from '../../packages/albus-transfer-sdk/src'
import { createTestData, createTestProofRequest, payer, provider, requestAirdrop } from './utils'

describe('albusTransfer', () => {
  const client = new AlbusClient(provider).local()
  const transferClient = new AlbusTransferClient(provider)
  const receiver = Keypair.generate()

  let proofRequest: PublicKey
  let policy: PublicKey

  beforeAll(async () => {
    await requestAirdrop(payer.publicKey)
    const testData = await createTestData(client, 'transfer')
    policy = testData.policy
    proofRequest = await createTestProofRequest(client, client, 'transfer')
  })

  it('can transfer SOL', async () => {
    await transferClient.transfer({
      amount: new BN(LAMPORTS_PER_SOL),
      receiver: receiver.publicKey,
      proofRequest,
      policy,
    })
  })

  it('can transfer token', async () => {
    const tokenMint = await createMint(provider.connection, payer, payer.publicKey, null, 9)
    const source = await getOrCreateAssociatedTokenAccount(provider.connection, payer, tokenMint, payer.publicKey)
    const destination = await getOrCreateAssociatedTokenAccount(provider.connection, payer, tokenMint, receiver.publicKey)
    await mintTo(provider.connection, payer, tokenMint, source.address, payer.publicKey, 100)
    await transferClient.transferToken({
      destination: destination.address,
      source: source.address,
      tokenMint,
      amount: new BN(10),
      receiver: receiver.publicKey,
      proofRequest,
      policy,
    })
  })
})
