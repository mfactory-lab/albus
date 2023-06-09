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
import { BN } from '@coral-xyz/anchor'
import log from 'loglevel'
import { getOrCreateAssociatedTokenAccount } from '@solana/spl-token'
import { useContext } from '../../context'
import { exploreTransaction } from '../../utils'

interface Opts {
  zkp: string
  receiver: string
  amount: string
  mint: string
}

export async function splTransfer(opts: Opts) {
  const { transferClient, keypair } = useContext()

  const tokenMint = new PublicKey(opts.mint)
  const receiver = new PublicKey(opts.receiver)
  const source = await getOrCreateAssociatedTokenAccount(transferClient.connection, keypair, tokenMint, keypair.publicKey)
  const destination = await getOrCreateAssociatedTokenAccount(transferClient.connection, keypair, tokenMint, receiver)

  try {
    const signature = await transferClient.splTransfer({
      amount: new BN(opts.amount),
      destination: destination.address,
      receiver,
      source: source.address,
      tokenMint,
      zkpRequest: new PublicKey(opts.zkp),
    })

    log.info(`Signature: ${signature}`)
    log.info(exploreTransaction(signature))
  } catch (e) {
    log.error(e)
  }
}
