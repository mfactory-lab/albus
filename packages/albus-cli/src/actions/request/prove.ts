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
import { Keypair } from '@solana/web3.js'
import log from 'loglevel'
import { useContext } from '@/context'

interface Opts {
  // Verifiable Credential Address
  vc: string
  // Path to decryption key
  decryptionKey?: string
}

/**
 * Create a proof for {@link proofRequest} address
 */
export async function proveRequest(proofRequestAddr: string, opts: Opts) {
  const { client, keypair } = useContext()

  let decryptionKey: any
  if (opts.decryptionKey) {
    decryptionKey = Keypair.fromSecretKey(
      Buffer.from(JSON.parse(fs.readFileSync(opts.decryptionKey).toString())),
    ).secretKey
  }

  log.log('Generating proof...')

  const { signatures } = await client.proofRequest.fullProve({
    userPrivateKey: keypair.secretKey,
    proofRequest: proofRequestAddr,
    decryptionKey,
    vc: opts.vc,
  })

  log.info(`Signatures: ${signatures}`)
}
