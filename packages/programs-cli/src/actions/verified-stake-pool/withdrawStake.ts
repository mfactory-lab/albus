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

import { PublicKey } from '@solana/web3.js'
import log from 'loglevel'
import { BN } from '@coral-xyz/anchor'
import { STAKE_POOL_PROGRAM_ID, stakePoolInfo } from '@solana/spl-stake-pool'
import { useContext } from '../../context'
import { exploreTransaction } from '../../utils'

interface Opts {
  proofRequest: string
  stakePool: string
  source: string
  stakeToReceive: string
  splitStake: string
  authority: string
  amount: string
}

export async function withdrawStake(opts: Opts) {
  const { stakePoolClient } = useContext()

  const stakePool = await stakePoolInfo(stakePoolClient.connection, new PublicKey(opts.stakePool))

  try {
    const signature = await stakePoolClient.withdrawStake({
      amount: new BN(opts.amount),
      managerFeeAccount: new PublicKey(stakePool.managerFeeAccount),
      poolMint: new PublicKey(stakePool.poolMint),
      poolTokensFrom: new PublicKey(opts.source),
      stakePool: new PublicKey(opts.stakePool),
      stakePoolProgram: STAKE_POOL_PROGRAM_ID,
      stakePoolWithdrawAuthority: new PublicKey(stakePool.poolWithdrawAuthority),
      stakeToReceive: new PublicKey(opts.stakeToReceive),
      stakeToSplit: new PublicKey(opts.splitStake),
      userStakeAuthority: new PublicKey(opts.authority),
      validatorListStorage: new PublicKey(stakePool.validatorListStorageAccount),
      proofRequest: new PublicKey(opts.proofRequest),
    })

    log.info(`Signature: ${signature}`)
    log.info(exploreTransaction(signature))
  } catch (e) {
    log.error(e)
  }
}
