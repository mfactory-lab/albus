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

import { Buffer } from 'node:buffer'
import {
  Authorized,
  Keypair,
  LAMPORTS_PER_SOL,
  Lockup,
  PublicKey,
  StakeProgram,
  SystemProgram,
  Transaction,
  VoteInit,
  VoteProgram,
} from '@solana/web3.js'
import { afterAll, assert, beforeAll, describe, it } from 'vitest'
import { createAssociatedTokenAccount, createMint } from '@solana/spl-token'
import { AlbusClient, ProofRequestStatus } from '../../packages/albus-sdk/src'
import {
  STAKE_POOL_PROGRAM_ID,
  addValidatorToPool,
  depositStake,
  getStakePoolAccount,
  initialize,
} from '../../packages/albus-stake-pool-sdk/src'
import { MINIMUM_RESERVE_LAMPORTS } from '../../packages/albus-stake-pool-sdk/src/constants'
import { getValidatorListAccount } from '../../packages/albus-stake-pool-sdk/src/utils'
import { createTestData, createTestProofRequest, deleteTestData, initProvider, payer, provider, requestAirdrop } from './utils'

describe('albusStakePool', async () => {
  const user = Keypair.generate()
  const vote = Keypair.generate()

  const client = new AlbusClient(provider).local()
  const userClient = new AlbusClient(initProvider(user)).local()

  let stakePool: PublicKey
  let stakePoolMint: PublicKey
  let validatorList: PublicKey
  let withdrawAuthority: PublicKey
  let reserveStakeAccount: PublicKey
  let managerFeeAccount: PublicKey

  // test policy
  let policy: PublicKey

  console.log(`userPubkey: ${user.publicKey}`)
  console.log(`votePubkey: ${vote.publicKey}`)

  beforeAll(async () => {
    await requestAirdrop(payer.publicKey)
    await requestAirdrop(user.publicKey)

    // albus test data
    const testData = await createTestData(client, 'stakePool')
    policy = testData.policy
  })

  afterAll(async () => {
    await deleteTestData(client, 'stakePool')
  })

  async function addTestStakeAccount(votePubkey: PublicKey) {
    const keypair = Keypair.generate()

    const signature = await userClient.provider.sendAndConfirm(new Transaction()
      .add(StakeProgram.createAccount({
        fromPubkey: user.publicKey,
        authorized: new Authorized(user.publicKey, user.publicKey),
        lamports: (await provider.connection.getMinimumBalanceForRentExemption(StakeProgram.space))
        + 10 * LAMPORTS_PER_SOL,
        lockup: new Lockup(0, 0, user.publicKey),
        stakePubkey: keypair.publicKey,
      }))

      .add(StakeProgram.delegate({
        stakePubkey: keypair.publicKey,
        authorizedPubkey: user.publicKey,
        votePubkey,
      })), [user, keypair, user, user])

    return {
      keypair,
      signature,
    }
  }

  it('can initialize new stake pool', async () => {
    const stakePoolKeypair = Keypair.generate()
    const validatorListKeypair = Keypair.generate()
    validatorList = validatorListKeypair.publicKey

    const [_withdrawAuthority] = PublicKey.findProgramAddressSync(
      [stakePoolKeypair.publicKey.toBuffer(), Buffer.from('withdraw')],
      STAKE_POOL_PROGRAM_ID,
    )
    withdrawAuthority = _withdrawAuthority

    stakePoolMint = await createMint(provider.connection, payer, withdrawAuthority, null, 9)
    managerFeeAccount = await createAssociatedTokenAccount(provider.connection, payer, stakePoolMint, provider.wallet.publicKey)

    const stakeMinDelegation = LAMPORTS_PER_SOL

    // Create reserve stake account
    const reserveKeypair = Keypair.generate()
    reserveStakeAccount = reserveKeypair.publicKey

    const stakeMinLamports = await provider.connection.getMinimumBalanceForRentExemption(StakeProgram.space)
    const reserveStakeBalance = stakeMinLamports + stakeMinLamports + stakeMinDelegation + MINIMUM_RESERVE_LAMPORTS

    await provider.sendAndConfirm(
      StakeProgram.createAccount({
        fromPubkey: provider.wallet.publicKey,
        authorized: new Authorized(withdrawAuthority, withdrawAuthority),
        lamports: reserveStakeBalance,
        stakePubkey: reserveStakeAccount,
      }),
      [payer, reserveKeypair],
    )

    const data = {
      connection: provider.connection,
      manager: payer,
      managerPoolAccount: managerFeeAccount,
      poolMint: stakePoolMint,
      reserveStake: reserveStakeAccount,
      stakePool: stakePoolKeypair,
      validatorList: validatorListKeypair,
      depositPolicy: policy,
      // addValidatorPolicy: policy,
    }

    // Create stake pool
    const { instructions, signers } = await initialize(data)
    const tx = new Transaction().add(...instructions)
    try {
      await provider.sendAndConfirm(tx, signers)
      stakePool = stakePoolKeypair.publicKey
    } catch (e) {
      assert.ok(false)
      console.log(e)
    }

    const sp = await getStakePoolAccount(provider.connection, stakePool)

    assert.deepEqual(sp.account.data.depositPolicy, data.depositPolicy)
    // assert.deepEqual(sp.account.data.addValidatorPolicy, data.addValidatorPolicy)
  })

  it('can add validator to the pool', async () => {
    if (!stakePool) {
      assert.ok(false, 'No stake pool')
      return
    }

    const nodeAccount = Keypair.generate()
    const voteLamports = (await provider.connection.getMinimumBalanceForRentExemption(VoteProgram.space)) + 10 * LAMPORTS_PER_SOL
    const tx = new Transaction()

    tx.add(
      VoteProgram.createAccount({
        fromPubkey: payer.publicKey,
        votePubkey: vote.publicKey,
        lamports: voteLamports,
        voteInit: new VoteInit(
          nodeAccount.publicKey,
          payer.publicKey,
          payer.publicKey,
          1,
        ),
      }),
    )

    tx.instructions[0] = SystemProgram.createAccount({
      fromPubkey: payer.publicKey,
      newAccountPubkey: vote.publicKey,
      lamports: voteLamports,
      space: 3762, // timely vote credits has a new vote account layout, which doesn't work correctly with solana web3.js
      programId: VoteProgram.programId,
    })

    const { instructions: addValidatorIxs } = await addValidatorToPool(provider.connection, stakePool, vote.publicKey)
    tx.add(...addValidatorIxs)

    const signers = [payer, vote, nodeAccount]

    try {
      await provider.sendAndConfirm(tx, signers)
    } catch (e) {
      console.log(e)
      throw e
    }

    const validatorListData = await getValidatorListAccount(provider.connection, validatorList)
    assert.equal(validatorListData.account.data.validators.length, 1)
  })

  it('can deposit stake with valid proof request', async () => {
    const proofRequest = await createTestProofRequest(userClient, client, 'stakePool')
    console.log(`proofRequestPubkey: ${proofRequest}`)

    const { keypair } = await addTestStakeAccount(vote.publicKey)

    const { instructions, signers } = await depositStake(
      userClient.provider.connection,
      stakePool,
      user.publicKey,
      vote.publicKey,
      keypair.publicKey,
    )

    const tx = new Transaction().add(...instructions)

    try {
      await userClient.provider.sendAndConfirm(tx, signers)
    } catch (e) {
      console.log(e)
      throw e
    }
  })

  it('cannot deposit stake with invalid proof request', async () => {
    const votePubkey = vote.publicKey

    const proofRequest = await createTestProofRequest(userClient, client, 'stakePool', ProofRequestStatus.Rejected)
    console.log(`proofRequestPubkey: ${proofRequest}`)

    const { keypair } = await addTestStakeAccount(votePubkey)

    const { instructions, signers } = await depositStake(
      userClient.provider.connection,
      stakePool,
      user.publicKey,
      votePubkey,
      keypair.publicKey,
    )

    const tx = new Transaction().add(...instructions)

    try {
      await userClient.provider.sendAndConfirm(tx, signers)
    } catch (e: any) {
      assert.ok(!!e.logs.find((l: string) => l.includes('Proof request is rejected')))
      assert.ok(true)
    }
  })
})
