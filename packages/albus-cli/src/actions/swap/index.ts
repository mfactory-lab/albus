import { AlbusSwapClient, createCloseAccountInstruction } from '@albus-finance/swap-sdk'
import { PublicKey, Transaction } from '@solana/web3.js'
import log from 'loglevel'
import Table from 'cli-table3'
import { useContext } from '@/context'

export async function findAll() {
  const { provider } = useContext()

  const client = new AlbusSwapClient(provider)
  const pools = await client.loadAll()

  log.info(`Found: ${pools.length} swap pools`)

  const table = new Table({
    head: ['#', 'Address', 'Mint', 'Policy'],
  })

  let i = 0
  for (const { pubkey, data } of pools) {
    table.push([
      String(++i),
      String(pubkey),
      String(data?.poolMint),
      String(data?.policy),
    ])
  }

  console.log(table.toString())
}

export async function closeAll() {
  const { provider } = useContext()

  const client = new AlbusSwapClient(provider)
  const pools = await client.loadAll()

  for (const { pubkey } of pools) {
    log.info(`Close: ${pubkey}`)
    const ix = await createCloseAccountInstruction({
      authority: client.provider.publicKey,
      account: pubkey,
    })
    const signature = await provider.sendAndConfirm(new Transaction().add(ix))
    log.info(`Signature: ${signature}`)
  }

  log.info('Done')
}

export async function close(addr: string) {
  const { provider } = useContext()

  const account = new PublicKey(addr)
  const client = new AlbusSwapClient(provider)

  const ix = await createCloseAccountInstruction({
    authority: client.provider.publicKey,
    account,
  })

  const signature = await provider.sendAndConfirm(new Transaction().add(ix))

  log.info(`Signature: ${signature}`)
}
