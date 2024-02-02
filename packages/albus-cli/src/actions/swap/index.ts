import {
  AlbusSwapClient, TokenSwapOld, createUpdatePolicyInstruction, tokenSwapDiscriminator,
} from '@albus-finance/swap-sdk'
import log from 'loglevel'
import Table from 'cli-table3'
import { Transaction } from '@solana/web3.js'
import { useContext } from '@/context'

export async function migrate() {
  const { provider } = useContext()

  const client = new AlbusSwapClient(provider)

  const accounts = await TokenSwapOld.gpaBuilder()
    .addFilter('accountDiscriminator', tokenSwapDiscriminator)
    .run(client.connection)

  for (const { pubkey, account } of accounts) {
    const data = TokenSwapOld.fromAccountInfo(account)[0]
    log.info(`Processing ${pubkey}...`)
    if (!data) {
      log.info(`Pool ${pubkey} not found...`)
      continue
    }

    // const signature = await provider.sendAndConfirm(new Transaction().add(
    //   createMigrateInstruction({ tokenSwap: pubkey, payer: provider.publicKey }),
    // ))
    // log.info(`Signature: ${signature}`)

    const signature2 = await provider.sendAndConfirm(new Transaction().add(
      createUpdatePolicyInstruction({ tokenSwap: pubkey }),
    ))
    log.info(`signature: ${signature2}`)
  }

  log.info('Done')
}

export async function findAll() {
  const { provider } = useContext()

  const client = new AlbusSwapClient(provider)
  const pools = await client.loadAll()

  log.info(`Found: ${pools.length} swap pools`)

  const table = new Table({
    head: ['#', 'Address', 'Mint', 'Swap Policy', 'Add Liquidity Policy'],
  })

  let i = 0
  for (const { pubkey, data } of pools) {
    table.push([
      String(++i),
      String(pubkey),
      String(data?.poolMint),
      String(data?.swapPolicy),
      String(data?.addLiquidityPolicy),
    ])
  }

  console.log(table.toString())
}

export async function closeAll() {
  // const { provider } = useContext()
  // const client = new AlbusSwapClient(provider)
  // const pools = await client.loadAll()
  //
  // for (const { pubkey } of pools) {
  //   log.info(`Close: ${pubkey}`)
  //   const ix = createCloseAccountInstruction({
  //     authority: provider.publicKey,
  //     account: pubkey,
  //   })
  //   const signature = await provider.sendAndConfirm(new Transaction().add(ix))
  //   log.info(`Signature: ${signature}`)
  // }
  //
  // log.info('Done')
}
//
// export async function close(addr: string) {
//   const { provider } = useContext()
//
//   const account = new PublicKey(addr)
//   const ix = createCloseAccountInstruction({
//     authority: provider.publicKey,
//     account,
//   })
//
//   const signature = await provider.sendAndConfirm(new Transaction().add(ix))
//
//   log.info(`Signature: ${signature}`)
// }
