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
import { readFileSync } from 'node:fs'
import * as Albus from '@mfactory-lab/albus-core'
import { Keypair } from '@solana/web3.js'
import log from 'loglevel'
import { useContext } from '@/context'

interface Opts {
  email?: string
  website?: string
  keypair?: string
}

export async function create(name: string, opts: Opts) {
  const { client } = useContext()

  let keypair: Keypair
  if (opts.keypair) {
    keypair = Keypair.fromSecretKey(Buffer.from(JSON.parse(readFileSync(opts.keypair).toString())))
  } else {
    keypair = Keypair.generate()
    log.info('New encryption keypair was generated!')
    log.info(`SecretKey: [${keypair.secretKey}]`)
    log.info(`PublicKey: ${keypair.publicKey}`)
  }

  const { key } = Albus.zkp.generateEncryptionKey(keypair)

  const { signature, address } = await client.trustee.create({
    key: Array.from(key),
    name,
    email: opts.email ?? '',
    website: opts.website ?? '',
  })

  log.info('\nDone')
  log.info(`Signature: ${signature}`)
  log.info(`\nAddress: ${address}`)
  log.info(`\nKey: ${key}`)
}