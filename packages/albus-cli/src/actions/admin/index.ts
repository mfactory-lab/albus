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

import * as Albus from '@albus-finance/core'
import {
  createAdminCloseAccountInstruction,
  policyDiscriminator,
  proofRequestDiscriminator,
  trusteeDiscriminator,
} from '@albus-finance/sdk'
import { PublicKey, Transaction } from '@solana/web3.js'
import log from 'loglevel'
import { useContext } from '@/context'

export * from './info'
export * from './migrate'

export async function fund(_opts: any) {
  const { client } = useContext()
  const addr = client.pda.authority()[0]
  log.info(`Funding ${addr} ...`)
  const signature = await client.provider.connection.requestAirdrop(addr, 2)
  log.info(`Signature: ${signature}`)
}

type ClearOpts = {
  accountType?: string
  dryRun?: boolean
}

export async function clear(opts: ClearOpts) {
  const { client } = useContext()

  const filters: any[] = []

  if (opts.dryRun) {
    log.info(`--- DRY-RUN MODE ---`)
  }

  if (opts.accountType) {
    let discriminator: number[] = []
    switch (opts.accountType) {
      case 'proofRequest':
        discriminator = proofRequestDiscriminator
        break
      case 'trustee':
        discriminator = trusteeDiscriminator
        break
      case 'policy':
        discriminator = policyDiscriminator
        break
      // ...
    }
    filters.push({
      memcmp: {
        offset: 0,
        bytes: Albus.crypto.utils.bytesToBase58(discriminator),
      },
    })

    log.info(`Filter by account type ${opts.accountType}`)
  }

  const accounts = await client.provider.connection
    .getProgramAccounts(client.programId, { filters })

  log.info(`Found ${accounts.length} program accounts`)
  for (const { pubkey } of accounts) {
    if (!opts.dryRun) {
      await closeAccount(pubkey)
    }
  }
}

export async function close(address: string) {
  await closeAccount(new PublicKey(address))
  log.info('Done')
}

async function closeAccount(pubkey: PublicKey) {
  const { client } = useContext()
  log.info(`Deleting: ${pubkey}`)
  const ix = createAdminCloseAccountInstruction({
    authority: client.provider.publicKey,
    account: pubkey,
  }, client.programId)
  const sig = await client.provider.sendAndConfirm(new Transaction().add(ix))
  log.info(`Signature: ${sig}`)
}
