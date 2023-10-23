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

import fs from 'node:fs'
import { Buffer } from 'node:buffer'
import { Keypair, PublicKey } from '@solana/web3.js'
import log from 'loglevel'
import { STAKE_POOL_PROGRAM_ID, stakePoolInfo } from '@solana/spl-stake-pool'
import { useContext } from '../../context'
import { exploreTransaction } from '../../utils'

interface Opts {
  zkp: string
  stakePool: string
  stake: string
  validator: string
  staker: string
}

export async function addValidator(opts: Opts) {
  const { stakePoolClient } = useContext()

  const stakePool = await stakePoolInfo(stakePoolClient.connection, new PublicKey(opts.stakePool))
  const stakerKeypair = Keypair.fromSecretKey(Buffer.from(JSON.parse(fs.readFileSync(opts.staker).toString())))

  try {
    const signature = await stakePoolClient.addValidator({
      stake: new PublicKey(opts.stake),
      stakePool: new PublicKey(opts.stakePool),
      stakePoolProgram: STAKE_POOL_PROGRAM_ID,
      stakePoolWithdrawAuthority: new PublicKey(stakePool.poolWithdrawAuthority),
      staker: stakerKeypair,
      validator: new PublicKey(opts.validator),
      validatorListStorage: new PublicKey(stakePool.validatorListStorageAccount),
      zkpRequest: new PublicKey(opts.zkp),
    })

    log.info(`Signature: ${signature}`)
    log.info(exploreTransaction(signature))
  } catch (e) {
    log.error(e)
  }
}
