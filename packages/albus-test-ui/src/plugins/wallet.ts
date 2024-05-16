import type { App } from 'vue'
import SolanaWallets from 'solana-wallets-vue'

import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from '@solana/wallet-adapter-wallets'

export function install({ app }: { app: App<Element> }) {
  app.use(SolanaWallets as any, {
    wallets: [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ],
    autoConnect: true,
  })
}
