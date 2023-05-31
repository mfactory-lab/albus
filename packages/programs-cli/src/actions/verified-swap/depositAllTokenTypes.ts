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

import { BN } from '@project-serum/anchor'
import { getOrCreateAssociatedTokenAccount } from '@solana/spl-token'
import { Account, PublicKey } from '@solana/web3.js'
import log from 'loglevel'
import { TOKEN_SWAP_PROGRAM_ID, TokenSwap } from '@solana/spl-token-swap'
import { useContext } from '../../context'
import { exploreTransaction } from '../../utils'

interface Opts {
  zkp: string
  swap: string
  maxA: string
  maxB: string
  authority: string
  amount: string
}

export async function depositAll(opts: Opts) {
  const { swapClient, keypair } = useContext()

  const tokenSwap = await TokenSwap.loadTokenSwap(swapClient.connection, new PublicKey(opts.swap), TOKEN_SWAP_PROGRAM_ID, new Account(keypair.secretKey))
  const depositTokenA = await getOrCreateAssociatedTokenAccount(swapClient.connection, keypair, tokenSwap.mintA, keypair.publicKey)
  const depositTokenB = await getOrCreateAssociatedTokenAccount(swapClient.connection, keypair, tokenSwap.mintB, keypair.publicKey)
  const destination = await getOrCreateAssociatedTokenAccount(swapClient.connection, keypair, tokenSwap.poolToken, keypair.publicKey)

  try {
    const signature = await swapClient.depositAll({
      authority: new PublicKey(opts.authority),
      depositTokenA: depositTokenA.address,
      depositTokenB: depositTokenB.address,
      destination: destination.address,
      maximumTokenAAmount: new BN(opts.maxA),
      maximumTokenBAmount: new BN(opts.maxB),
      poolMint: tokenSwap.poolToken,
      poolTokenAmount: new BN(opts.amount),
      splTokenSwapProgram: TOKEN_SWAP_PROGRAM_ID,
      swap: tokenSwap.tokenSwap,
      swapTokenA: tokenSwap.tokenAccountA,
      swapTokenB: tokenSwap.tokenAccountB,
      zkpRequest: new PublicKey(opts.zkp),
    })

    log.info(`Signature: ${signature}`)
    log.info(exploreTransaction(signature))
  } catch (e) {
    log.error(e)
  }
}
