import type { Connection } from '@solana/web3.js'
import type { AnchorWallet } from 'solana-wallets-vue'
import { AnchorProvider } from '@coral-xyz/anchor'

export function shortenAddress(address: string, chars = 4): string {
  return `${address.slice(0, chars)}...${address.slice(-chars)}`
}

export function newProvider(wallet: AnchorWallet, connection: Connection) {
  const opts = AnchorProvider.defaultOptions()
  return new AnchorProvider(
    connection,
    wallet,
    opts,
  )
}
