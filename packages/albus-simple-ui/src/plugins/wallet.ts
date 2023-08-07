import type { App } from 'vue'
import SolanaWallets from 'solana-wallets-vue'

import {
  AvanaWalletAdapter,
  BitKeepWalletAdapter,
  BitpieWalletAdapter,
  BloctoWalletAdapter,
  BraveWalletAdapter,
  CloverWalletAdapter,
  Coin98WalletAdapter,
  CoinbaseWalletAdapter,
  CoinhubWalletAdapter,
  ExodusWalletAdapter,
  GlowWalletAdapter,
  HuobiWalletAdapter,
  HyperPayWalletAdapter,
  KrystalWalletAdapter,
  LedgerWalletAdapter,
  MathWalletAdapter,
  NekoWalletAdapter,
  NufiWalletAdapter,
  PhantomWalletAdapter,
  SafePalWalletAdapter,
  SaifuWalletAdapter,
  SalmonWalletAdapter,
  SkyWalletAdapter,
  SlopeWalletAdapter,
  SolflareWalletAdapter,
  SolletExtensionWalletAdapter,
  SolletWalletAdapter,
  SolongWalletAdapter, SpotWalletAdapter,
  TokenPocketWalletAdapter,
} from '@solana/wallet-adapter-wallets'
// import { normalizePath } from '@/utils'

export function install({ app }: { app: App<Element> }) {
  // const network = WalletAdapterNetwork.Mainnet;

  // const path = normalizePath(window.location.pathname)
  const path = window.location.pathname

  app.use(SolanaWallets as any, {
    wallets: [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new SolletWalletAdapter(),
      new SolletExtensionWalletAdapter(),
      new CoinbaseWalletAdapter(),
      new SlopeWalletAdapter(),
      new SolongWalletAdapter(),
      new CloverWalletAdapter(),
      new ExodusWalletAdapter(),
      new BitKeepWalletAdapter(),
      new BitpieWalletAdapter(),
      new Coin98WalletAdapter(),
      new CoinhubWalletAdapter(),
      new SafePalWalletAdapter(),
      new TokenPocketWalletAdapter(),
      new GlowWalletAdapter(),
      new MathWalletAdapter(),
      new LedgerWalletAdapter(),
      new BloctoWalletAdapter(),
      new HyperPayWalletAdapter(),
      new SkyWalletAdapter(),
      new NufiWalletAdapter(),
      new SaifuWalletAdapter(),
      new NekoWalletAdapter(),
      new SpotWalletAdapter(),
      new AvanaWalletAdapter(),
      new KrystalWalletAdapter(),
      new HuobiWalletAdapter(),
      new BraveWalletAdapter(),
      new SalmonWalletAdapter(),
    ],
    autoConnect: !!['holder', 'business'].includes(path),
  })
}
