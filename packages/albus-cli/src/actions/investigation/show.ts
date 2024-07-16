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
import { Keypair } from '@solana/web3.js'
import type { PublicKey } from '@solana/web3.js'
import log from 'loglevel'
import Table from 'cli-table3'
import { useContext } from '@/context'
import { shortenAddress } from '@/utils'

type Opts = {
  encryptionKey?: string
}

export async function show(addr: string | PublicKey, opts: Opts) {
  const { client } = useContext()
  const data = await client.investigation.load(addr)

  log.info({ address: addr, ...data.pretty() })

  const shares = await client.investigation.findShares({
    investigationRequest: addr,
  })

  log.info(`\n========= Shares (${shares.length}) =========\n`)

  for (const share of shares) {
    log.info({ address: share.pubkey, ...share.data?.pretty() })
  }

  if (opts.encryptionKey) {
    log.info(`\n========= Encrypted Payload =========\n`)

    const encryptionKey = Keypair.fromSecretKey(Buffer.from(JSON.parse(readFileSync(opts.encryptionKey).toString())))

    const decryptedData = await client.investigation.decryptData({
      investigationRequest: addr,
      encryptionKey: encryptionKey.secretKey,
    })

    log.info(decryptedData)
  }
}

export async function showAll() {
  const { client } = useContext()

  const accounts = await client.investigation.find()

  log.info(`Found ${accounts.length} accounts`)

  const table = new Table({
    head: ['#', 'Address', 'Authority', 'ProofReq', 'ProofReqOwner', 'Shares', 'Status', 'Created'],
  })

  let i = 0
  for (const { pubkey, data } of accounts) {
    table.push([
      String(++i),
      String(pubkey),
      String(shortenAddress(data!.authority)),
      String(shortenAddress(data!.proofRequest)),
      String(shortenAddress(data!.proofRequestOwner)),
      String(`${data!.revealedShareCount}/${data!.requiredShareCount}`),
      String(data?.status),
      String(new Date(Number(data!.createdAt) * 1000).toISOString()),
    ])
  }

  console.log(table.toString())
}
