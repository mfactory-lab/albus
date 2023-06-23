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
import fs from 'node:fs'
import { Keypair, PublicKey } from '@solana/web3.js'
import { StakeAuthorize } from '@albus/verified-stake-sdk/src/generated'
import log from 'loglevel'
import { useContext } from '../../context'
import { exploreTransaction } from '../../utils'

interface Opts {
  proofRequest: string
  stake: string
  newAuthorizedPath: string
  authorized: string
}

export async function authorizeChecked(opts: Opts) {
  const { stakeClient } = useContext()

  const newAuthorizedKeypair = Keypair.fromSecretKey(Buffer.from(JSON.parse(fs.readFileSync(opts.newAuthorizedPath).toString())))

  let authorized = StakeAuthorize.Staker

  if (opts.authorized === 'w') {
    authorized = StakeAuthorize.Withdrawer
  }

  try {
    const signature = await stakeClient.authorizeChecked({
      newAuthorized: newAuthorizedKeypair,
      stake: new PublicKey(opts.stake),
      stakeAuthorized: authorized,
      proofRequest: new PublicKey(opts.proofRequest),
    })

    log.info(`Signature: ${signature}`)
    log.info(exploreTransaction(signature))
  } catch (e) {
    log.error(e)
  }
}
