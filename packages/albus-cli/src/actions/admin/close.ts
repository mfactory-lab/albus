import log from 'loglevel'
import {
  circuitDiscriminator,
  createAdminCloseAccountInstruction,
  credentialRequestDiscriminator,
  credentialSpecDiscriminator,
  investigationRequestDiscriminator, investigationRequestShareDiscriminator, issuerDiscriminator,
  policyDiscriminator,
  proofRequestDiscriminator, serviceProviderDiscriminator,
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

  const accountDiscriminators = {
    circuit: circuitDiscriminator,
    credentialRequest: credentialRequestDiscriminator,
    credentialSpec: credentialSpecDiscriminator,
    proofRequest: proofRequestDiscriminator,
    investigationRequest: investigationRequestDiscriminator,
    investigationRequestShare: investigationRequestShareDiscriminator,
    serviceProvider: serviceProviderDiscriminator,
    policy: policyDiscriminator,
    trustee: trusteeDiscriminator,
    issuer: issuerDiscriminator,
  }

  if (opts.accountType) {
    const discriminator = accountDiscriminators[opts.accountType]
    if (!discriminator) {
      throw new Error(`Unknown account type ${opts.accountType}`)
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

  const stats = {}

  for (const { pubkey, account } of accounts) {
    const disc = Array.from(account.data.subarray(0, 8))
    Object.entries(accountDiscriminators).forEach(([k, v]) => {
      if (disc.toString() === v.toString()) {
        if (!stats[k]) {
          stats[k] = 0
        }
        stats[k]++
      }
    })
    if (!opts.dryRun) {
      await closeAccount(pubkey)
    }
  }

  console.log('Stats', stats)
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
