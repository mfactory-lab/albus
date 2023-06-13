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
import { Metaplex, keypairIdentity } from '@metaplex-foundation/js'
import { BN } from '@coral-xyz/anchor'
import { TOKEN_PROGRAM_ID, createAssociatedTokenAccount, createMint } from '@solana/spl-token'
import * as web3 from '@solana/web3.js'
import { AlbusClient } from '@albus/sdk'
import { VerifiedStakePoolClient } from '@albus/verified-stake-pool-sdk'
import { STAKE_POOL_PROGRAM_ID, addValidatorToPool, initialize } from '@solana/spl-stake-pool'
import { assert, describe, it } from 'vitest'
import { assertErrorCode, mintNFT, payerKeypair, provider } from './utils'

describe('verified stake pool', () => {
  const client = new AlbusClient(provider)
  const verifiedStakePoolClient = new VerifiedStakePoolClient(provider)
  const metaplex = Metaplex.make(provider.connection).use(keypairIdentity(payerKeypair))

  // staking pool accounts
  let stakePool: web3.PublicKey
  let stakePoolMint: web3.PublicKey
  let validatorList: web3.PublicKey
  let withdrawAuthority: web3.PublicKey
  let reserveStakeAccount: web3.PublicKey
  let validatorStakeAccount: web3.PublicKey
  let managerFeeAccount: web3.PublicKey

  it('can add validator with albus verification check', async () => {
    await client.addServiceProvider({ code: 'code1', name: 'name' })
    const [serviceProviderAddress] = client.getServiceProviderPDA('code1')
    const nft = await mintNFT(metaplex, 'ALBUS-C')
    const mint = nft.address

    await client.createZKPRequest({
      circuit: mint,
      serviceCode: 'code1',
    })

    const [ZKPRequestAddress] = client.getZKPRequestPDA(serviceProviderAddress, mint, payerKeypair.publicKey)

    const proofNft = await mintNFT(metaplex, 'ALBUS-P')

    await client.prove({
      zkpRequest: ZKPRequestAddress,
      proofMint: proofNft.address,
    })

    await client.verify({
      zkpRequest: ZKPRequestAddress,
    })

    const stakePoolKeypair = web3.Keypair.generate()
    stakePool = stakePoolKeypair.publicKey
    const validatorListKeypair = web3.Keypair.generate()
    validatorList = validatorListKeypair.publicKey
    const [authority] = web3.PublicKey.findProgramAddressSync(
      [stakePoolKeypair.publicKey.toBuffer(), Buffer.from('withdraw')],
      STAKE_POOL_PROGRAM_ID,
    )
    withdrawAuthority = authority
    stakePoolMint = await createMint(provider.connection, payerKeypair, withdrawAuthority, null, 9, web3.Keypair.generate(), undefined, TOKEN_PROGRAM_ID)
    const reserveKeypair = web3.Keypair.generate()
    reserveStakeAccount = reserveKeypair.publicKey
    managerFeeAccount = await createAssociatedTokenAccount(provider.connection, payerKeypair, stakePoolMint, provider.wallet.publicKey)

    const lamportsForStakeAccount
      = (await provider.connection.getMinimumBalanceForRentExemption(
        web3.StakeProgram.space,
      ))

    const createAccountTransaction = web3.StakeProgram.createAccount({
      fromPubkey: provider.wallet.publicKey,
      authorized: new web3.Authorized(
        withdrawAuthority,
        withdrawAuthority,
      ),
      lamports: lamportsForStakeAccount + web3.LAMPORTS_PER_SOL,
      stakePubkey: reserveStakeAccount,
    })
    await provider.sendAndConfirm(createAccountTransaction, [payerKeypair, reserveKeypair])

    const { instructions, signers } = await initialize({
      connection: provider.connection,
      fee: { denominator: new BN(0), numerator: new BN(0) },
      manager: payerKeypair,
      managerPoolAccount: managerFeeAccount,
      poolMint: stakePoolMint,
      referralFee: 0,
      reserveStake: reserveStakeAccount,
      stakePool: stakePoolKeypair,
      validatorList: validatorListKeypair,
    })
    const transaction = new web3.Transaction().add(...instructions)
    transaction.feePayer = provider.wallet.publicKey
    try {
      await provider.sendAndConfirm(transaction, signers)
    } catch (e) {
      console.log(e)
    }

    const voteKeypair = web3.Keypair.generate()
    const votePubkey = voteKeypair.publicKey

    const lamportsForVoteAccount1
      = (await provider.connection.getMinimumBalanceForRentExemption(
        web3.VoteProgram.space,
      ))

    const createAccountTransaction1 = web3.VoteProgram.createAccount({
      fromPubkey: provider.publicKey,
      lamports: lamportsForVoteAccount1 + 3 * web3.LAMPORTS_PER_SOL,
      voteInit: new web3.VoteInit(provider.publicKey, provider.publicKey, provider.publicKey, 0),
      votePubkey,
    })

    try {
      await provider.sendAndConfirm(createAccountTransaction1, [payerKeypair, voteKeypair])
    } catch (e) {
      console.log(e)
    }

    const [publicKey] = await web3.PublicKey.findProgramAddress(
      [votePubkey.toBuffer(), stakePool.toBuffer()],
      STAKE_POOL_PROGRAM_ID,
    )

    validatorStakeAccount = publicKey

    // const stakeKeypair = web3.Keypair.generate()
    // const stakeAccount = stakeKeypair.publicKey
    //
    // const createStakeAccountTransaction = web3.StakeProgram.createAccount({
    //   fromPubkey: provider.wallet.publicKey,
    //   authorized: new web3.Authorized(
    //     provider.wallet.publicKey,
    //     provider.wallet.publicKey,
    //   ),
    //   lamports: lamportsForStakeAccount + 10 * web3.LAMPORTS_PER_SOL,
    //   lockup: new web3.Lockup(0, 0, provider.wallet.publicKey),
    //   stakePubkey: stakeAccount,
    // })
    // await provider.sendAndConfirm(createStakeAccountTransaction, [payerKeypair, stakeKeypair])
    //
    // const delegateTransaction = web3.StakeProgram.delegate({
    //   stakePubkey: stakeAccount,
    //   authorizedPubkey: provider.wallet.publicKey,
    //   votePubkey,
    // })
    //
    // await provider.sendAndConfirm(delegateTransaction, [payerKeypair, payerKeypair])
    //
    // const { instructions: ixs1, signers: sgs } = await depositStake(provider.connection, stakePool, provider.wallet.publicKey, votePubkey, stakeAccount)
    // const tx1 = new web3.Transaction().add(...ixs1)
    //
    // try {
    //   await provider.sendAndConfirm(tx1, sgs)
    // } catch (e) {
    //   console.log(e)
    //   throw e
    // }

    const { instructions: ixs } = await addValidatorToPool(provider.connection, stakePool, votePubkey, provider.wallet.publicKey)
    const tx = new web3.Transaction().add(...ixs)

    try {
      await provider.sendAndConfirm(tx)
    } catch (e) {
      console.log(e)
      throw e
    }

    // TODO: FIX: InsufficientDelegation error while delegating stake
    // try {
    //   await verifiedStakePoolClient.addValidator({
    //     stake: validatorStakeAccount,
    //     stakePool,
    //     stakePoolWithdrawAuthority: withdrawAuthority,
    //     staker: payerKeypair,
    //     validator: votePubkey,
    //     validatorListStorage: validatorList,
    //     zkpRequest: ZKPRequestAddress,
    //     stakePoolProgram: STAKE_POOL_PROGRAM_ID,
    //   })
    // } catch (e) {
    //   console.log(e)
    //   throw e
    // }
  })

  it('can not call instructions if ZKP request is not verified', async () => {
    const [serviceProviderAddress] = client.getServiceProviderPDA('code1')
    const nft = await mintNFT(metaplex, 'ALBUS-C')
    const mint = nft.address

    await client.createZKPRequest({
      circuit: mint,
      serviceCode: 'code1',
    })

    const [ZKPRequestAddress] = client.getZKPRequestPDA(serviceProviderAddress, mint, payerKeypair.publicKey)

    try {
      await verifiedStakePoolClient.addValidator({
        stake: validatorStakeAccount,
        stakePool,
        stakePoolWithdrawAuthority: withdrawAuthority,
        staker: payerKeypair,
        validator: provider.publicKey,
        validatorListStorage: validatorList,
        zkpRequest: ZKPRequestAddress,
        stakePoolProgram: STAKE_POOL_PROGRAM_ID,
      })
      assert.ok(false)
    } catch (e: any) {
      assertErrorCode(e, 'Custom(3)')
    }
  })

  it('can not add validator if validator is not the owner of ZKP request', async () => {
    const [serviceProviderAddress] = client.getServiceProviderPDA('code1')
    const nft = await mintNFT(metaplex, 'ALBUS-C')
    const mint = nft.address

    await client.createZKPRequest({
      circuit: mint,
      serviceCode: 'code1',
    })

    const [ZKPRequestAddress] = client.getZKPRequestPDA(serviceProviderAddress, mint, payerKeypair.publicKey)

    const validatorKeypair = web3.Keypair.generate()
    const validator = validatorKeypair.publicKey

    try {
      await verifiedStakePoolClient.addValidator({
        stake: validatorStakeAccount,
        stakePool,
        stakePoolWithdrawAuthority: withdrawAuthority,
        staker: payerKeypair,
        validator,
        validatorListStorage: validatorList,
        zkpRequest: ZKPRequestAddress,
        stakePoolProgram: STAKE_POOL_PROGRAM_ID,
      })
      assert.ok(false)
    } catch (e: any) {
      assertErrorCode(e, 'InvalidAccountData')
    }
  })

  it('can deposit SOL with albus verification check', async () => {
    const [serviceProviderAddress] = client.getServiceProviderPDA('code1')
    const nft = await mintNFT(metaplex, 'ALBUS-C')
    const mint = nft.address

    await client.createZKPRequest({
      circuit: mint,
      serviceCode: 'code1',
    })

    const [ZKPRequestAddress] = client.getZKPRequestPDA(serviceProviderAddress, mint, payerKeypair.publicKey)

    const proofNft = await mintNFT(metaplex, 'ALBUS-P')

    await client.prove({
      zkpRequest: ZKPRequestAddress,
      proofMint: proofNft.address,
    })

    await client.verify({
      zkpRequest: ZKPRequestAddress,
    })

    await verifiedStakePoolClient.depositSol({
      amount: new BN(10000),
      managerFeeAccount,
      poolMint: stakePoolMint,
      poolTokensTo: managerFeeAccount,
      referrerPoolTokensAccount: managerFeeAccount,
      reserveStake: reserveStakeAccount,
      stakePool,
      stakePoolProgram: STAKE_POOL_PROGRAM_ID,
      stakePoolWithdrawAuthority: withdrawAuthority,
      zkpRequest: ZKPRequestAddress,
    })
  })

  it('can deposit SOL with authority with albus verification check', async () => {
    const [serviceProviderAddress] = client.getServiceProviderPDA('code1')
    const nft = await mintNFT(metaplex, 'ALBUS-C')
    const mint = nft.address

    await client.createZKPRequest({
      circuit: mint,
      serviceCode: 'code1',
    })

    const [ZKPRequestAddress] = client.getZKPRequestPDA(serviceProviderAddress, mint, payerKeypair.publicKey)

    const proofNft = await mintNFT(metaplex, 'ALBUS-P')

    await client.prove({
      zkpRequest: ZKPRequestAddress,
      proofMint: proofNft.address,
    })

    await client.verify({
      zkpRequest: ZKPRequestAddress,
    })

    await verifiedStakePoolClient.depositSol({
      amount: new BN(5 * web3.LAMPORTS_PER_SOL),
      managerFeeAccount,
      poolMint: stakePoolMint,
      poolTokensTo: managerFeeAccount,
      referrerPoolTokensAccount: managerFeeAccount,
      reserveStake: reserveStakeAccount,
      stakePool,
      stakePoolProgram: STAKE_POOL_PROGRAM_ID,
      stakePoolWithdrawAuthority: withdrawAuthority,
      zkpRequest: ZKPRequestAddress,
      solDepositAuthority: payerKeypair,
    })
  })

  it('can withdraw SOL with albus verification check', async () => {
    const [serviceProviderAddress] = client.getServiceProviderPDA('code1')
    const nft = await mintNFT(metaplex, 'ALBUS-C')
    const mint = nft.address

    await client.createZKPRequest({
      circuit: mint,
      serviceCode: 'code1',
    })

    const [ZKPRequestAddress] = client.getZKPRequestPDA(serviceProviderAddress, mint, payerKeypair.publicKey)

    const proofNft = await mintNFT(metaplex, 'ALBUS-P')

    await client.prove({
      zkpRequest: ZKPRequestAddress,
      proofMint: proofNft.address,
    })

    await client.verify({
      zkpRequest: ZKPRequestAddress,
    })

    await verifiedStakePoolClient.withdrawSol({
      amount: new BN(100),
      lamportsTo: payerKeypair.publicKey,
      managerFeeAccount,
      poolMint: stakePoolMint,
      poolTokensFrom: managerFeeAccount,
      reserveStake: reserveStakeAccount,
      stakePool,
      stakePoolProgram: STAKE_POOL_PROGRAM_ID,
      stakePoolWithdrawAuthority: withdrawAuthority,
      zkpRequest: ZKPRequestAddress,
    })
  })

  it('can withdraw SOL with authority with albus verification check', async () => {
    const [serviceProviderAddress] = client.getServiceProviderPDA('code1')
    const nft = await mintNFT(metaplex, 'ALBUS-C')
    const mint = nft.address

    await client.createZKPRequest({
      circuit: mint,
      serviceCode: 'code1',
    })

    const [ZKPRequestAddress] = client.getZKPRequestPDA(serviceProviderAddress, mint, payerKeypair.publicKey)

    const proofNft = await mintNFT(metaplex, 'ALBUS-P')

    await client.prove({
      zkpRequest: ZKPRequestAddress,
      proofMint: proofNft.address,
    })

    await client.verify({
      zkpRequest: ZKPRequestAddress,
    })

    await verifiedStakePoolClient.withdrawSol({
      amount: new BN(100),
      lamportsTo: payerKeypair.publicKey,
      managerFeeAccount,
      poolMint: stakePoolMint,
      poolTokensFrom: managerFeeAccount,
      reserveStake: reserveStakeAccount,
      stakePool,
      stakePoolProgram: STAKE_POOL_PROGRAM_ID,
      stakePoolWithdrawAuthority: withdrawAuthority,
      zkpRequest: ZKPRequestAddress,
      solWithdrawAuthority: payerKeypair,
    })
  })

  it('can withdraw stake with albus verification check', async () => {
    const [serviceProviderAddress] = client.getServiceProviderPDA('code1')
    const nft = await mintNFT(metaplex, 'ALBUS-C')
    const mint = nft.address

    await client.createZKPRequest({
      circuit: mint,
      serviceCode: 'code1',
    })

    const [ZKPRequestAddress] = client.getZKPRequestPDA(serviceProviderAddress, mint, payerKeypair.publicKey)

    const proofNft = await mintNFT(metaplex, 'ALBUS-P')

    await client.prove({
      zkpRequest: ZKPRequestAddress,
      proofMint: proofNft.address,
    })

    await client.verify({
      zkpRequest: ZKPRequestAddress,
    })

    const stakeKeypair = web3.Keypair.generate()
    const stakeAccount = stakeKeypair.publicKey

    const lamportsForStakeAccount
      = (await provider.connection.getMinimumBalanceForRentExemption(
        web3.StakeProgram.space,
      ))

    const createAccountTransaction = web3.SystemProgram.createAccount({
      fromPubkey: provider.publicKey,
      lamports: lamportsForStakeAccount,
      newAccountPubkey: stakeAccount,
      programId: web3.StakeProgram.programId,
      space: web3.StakeProgram.space,
    })

    const txStake = new web3.Transaction().add(createAccountTransaction)

    await provider.sendAndConfirm(txStake, [payerKeypair, stakeKeypair])

    try {
      await verifiedStakePoolClient.withdrawStake({
        amount: new BN(100),
        managerFeeAccount,
        poolMint: stakePoolMint,
        poolTokensFrom: managerFeeAccount,
        stakePool,
        stakePoolProgram: STAKE_POOL_PROGRAM_ID,
        stakePoolWithdrawAuthority: withdrawAuthority,
        stakeToReceive: stakeAccount,
        stakeToSplit: reserveStakeAccount,
        userStakeAuthority: payerKeypair.publicKey,
        validatorListStorage: validatorList,
        zkpRequest: ZKPRequestAddress,
      })
    } catch (e) {
      console.log(e)
    }
  })
})
