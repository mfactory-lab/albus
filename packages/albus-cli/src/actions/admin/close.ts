import log from 'loglevel'
import {
  createAdminCloseAccountInstruction,
  policyDiscriminator,
  proofRequestDiscriminator,
  trusteeDiscriminator,
} from '@albus-finance/sdk'
import * as Albus from '@albus-finance/core'
import { PublicKey, Transaction } from '@solana/web3.js'
import { useContext } from '@/context'

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
