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

import type { Account } from '@solana/spl-token'
import { createMint, getAccount, getOrCreateAssociatedTokenAccount, mintTo } from '@solana/spl-token'
import type { PublicKey } from '@solana/web3.js'
import { Keypair } from '@solana/web3.js'
import { afterAll, assert, beforeAll, describe, it } from 'vitest'
import { AlbusClient } from '../../packages/albus-sdk/src'
import { AlbusSwapClient, CurveType } from '../../packages/albus-swap-sdk/src'
import { airdrop, createTestData, createTestProofRequest, deleteTestData, newProvider, payer, provider } from './utils'

async function tokenBalance(addr: PublicKey) {
  const acc = await getAccount(provider.connection, addr)
  return acc.amount
}

describe('albusSwap', async () => {
  const user = Keypair.generate()

  const client = new AlbusClient(provider).local()
  const userClient = new AlbusClient(newProvider(user)).local()
  const swapClient = new AlbusSwapClient(provider)
  const userSwapClient = new AlbusSwapClient(newProvider(user))

  const tokenSwap = Keypair.generate()
  const swapAuthority = swapClient.swapAuthority(tokenSwap.publicKey)

  let policy: PublicKey
  let poolMint: PublicKey
  let poolFeeAccount: Account
  let tokenA: PublicKey
  let tokenB: PublicKey
  let swapTokenA: Account
  let swapTokenB: Account
  let userTokenA: Account
  let userTokenB: Account
  let userPoolToken: Account

  beforeAll(async () => {
    await airdrop(payer.publicKey)
    await airdrop(user.publicKey)

    // create mint accounts
    tokenA = await createMint(provider.connection, payer, payer.publicKey, null, 9)
    tokenB = await createMint(provider.connection, payer, payer.publicKey, null, 9)
    poolMint = await createMint(provider.connection, payer, swapAuthority, null, 9)

    // create associated token accounts
    poolFeeAccount = await getOrCreateAssociatedTokenAccount(provider.connection, payer, poolMint, payer.publicKey)
    swapTokenA = await getOrCreateAssociatedTokenAccount(provider.connection, payer, tokenA, swapAuthority, true)
    swapTokenB = await getOrCreateAssociatedTokenAccount(provider.connection, payer, tokenB, swapAuthority, true)
    userTokenA = await getOrCreateAssociatedTokenAccount(provider.connection, user, tokenA, user.publicKey)
    userTokenB = await getOrCreateAssociatedTokenAccount(provider.connection, user, tokenB, user.publicKey)
    userPoolToken = await getOrCreateAssociatedTokenAccount(provider.connection, user, poolMint, user.publicKey)

    // initial balances
    await mintTo(provider.connection, payer, tokenA, swapTokenA.address, payer, 100_000_000_000)
    await mintTo(provider.connection, payer, tokenB, swapTokenB.address, payer, 100_000_000_000)

    await mintTo(provider.connection, payer, tokenA, userTokenA.address, payer, 10_000_000_000)

    // albus test data
    const testData = await createTestData(client, 'swap')

    policy = testData.policy
  })

  afterAll(async () => {
    await deleteTestData(client, 'swap')
  })

  it('can create a new token-swap', async () => {
    await swapClient.createTokenSwap({
      tokenSwap,
      poolMint,
      poolFee: poolFeeAccount.address,
      destination: poolFeeAccount.address,
      tokenA: swapTokenA.address,
      tokenB: swapTokenB.address,
      policy,
      curveType: CurveType.ConstantProduct,
      curveParameters: [],
      fees: {
        tradeFeeNumerator: 0,
        tradeFeeDenominator: 0,
        ownerTradeFeeNumerator: 0,
        ownerTradeFeeDenominator: 0,
        ownerWithdrawFeeNumerator: 0,
        ownerWithdrawFeeDenominator: 0,
        hostFeeNumerator: 0,
        hostFeeDenominator: 0,
      },
    })

    const tokenSwapData = await swapClient.load(tokenSwap.publicKey)

    assert.ok(tokenSwapData.isInitialized)
  })

  it('can swap tokens', async () => {
    const proofRequest = await createTestProofRequest(userClient, client, 'swap')

    await userSwapClient.swap({
      authority: swapAuthority,
      tokenSwap: tokenSwap.publicKey,
      proofRequest,
      poolMint,
      poolFee: poolFeeAccount.address,
      poolSource: swapTokenA.address,
      poolDestination: swapTokenB.address,
      userSource: userTokenA.address,
      userDestination: userTokenB.address,
      amountIn: 1_000_000_000,
      minimumAmountOut: 1_000_000,
    })
  })

  it('can deposit single token', async () => {
    const beforeBalance = await tokenBalance(swapTokenA.address)

    await userSwapClient.depositSingleTokenTypeExactAmountIn({
      tokenSwap: tokenSwap.publicKey,
      poolMint,
      source: userTokenA.address,
      destination: userPoolToken.address,
      swapTokenA: swapTokenA.address,
      swapTokenB: swapTokenB.address,
      sourceTokenAmount: 1_000_000_000,
      minimumPoolTokenAmount: 0,
    })

    const afterBalance = await tokenBalance(swapTokenA.address)
    assert.equal(afterBalance, beforeBalance + 1_000_000_000n)

    // const tokenSwapData = await swapClient.load(tokenSwap.publicKey)
    // console.log(tokenSwapData)
  })
})
