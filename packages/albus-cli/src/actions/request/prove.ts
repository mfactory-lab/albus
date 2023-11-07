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

import { Keypair } from '@solana/web3.js'
import log from 'loglevel'
import { useContext } from '@/context'

type Opts = {
  // Verifiable Credential Address
  vc: string
  // Path to a decryption key
  decryptionKey?: string
}

/**
 * Create a proof for {@link proofRequest} address
 */
export async function proveRequest(proofRequestAddr: string, opts: Opts) {
  const { client, keypair } = useContext()

  // let decryptionKey: any
  const decryptionKey = Keypair.fromSecretKey(
    Uint8Array.from([82, 210, 173, 237, 232, 206, 53, 47, 105, 175, 25, 145, 120, 111, 202, 28, 236, 115, 136, 39, 132, 171, 124, 156, 2, 243, 158, 97, 113, 144, 247, 226, 250, 194, 250, 173, 237, 207, 89, 252, 47, 17, 128, 41, 6, 112, 13, 108, 202, 204, 69, 122, 134, 97, 193, 68, 205, 178, 218, 209, 98, 45, 231, 20]),
  ).secretKey

  // if (opts.decryptionKey) {
  //   decryptionKey = Keypair.fromSecretKey(
  //     Buffer.from(JSON.parse(fs.readFileSync(opts.decryptionKey).toString())),
  //   ).secretKey
  // }

  log.info('Generating proof...')

  const { signatures } = await client.proofRequest.fullProve({
    userPrivateKey: keypair.secretKey,
    proofRequest: proofRequestAddr,
    decryptionKey,
    vc: opts.vc,
  })

  log.info(`Signatures: ${signatures}`)
}
