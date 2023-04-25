import { Buffer } from 'node:buffer'
import fs from 'node:fs'
import { Metaplex, bundlrStorage, keypairIdentity } from '@metaplex-foundation/js'
import { AnchorProvider, Wallet, web3 } from '@project-serum/anchor'
import type { Cluster } from '@solana/web3.js'
import { Keypair } from '@solana/web3.js'
import { clusterUrl } from './utils'
import config from './config'

export interface Context {
  cluster: Cluster | string
  provider: AnchorProvider
  keypair: Keypair
  metaplex: Metaplex
  config: typeof config
}

const context: Context = {
  cluster: 'devnet',
  // @ts-expect-error ...
  provider: undefined,
  // @ts-expect-error ...
  metaplex: undefined,
}

export function initContext({ cluster, keypair }: { cluster: Cluster; keypair: string }) {
  const opts = AnchorProvider.defaultOptions()
  const endpoint = cluster.startsWith('http') ? cluster : clusterUrl(cluster)
  const connection = new web3.Connection(endpoint, opts.commitment)
  const walletKeypair = Keypair.fromSecretKey(Buffer.from(JSON.parse(fs.readFileSync(keypair).toString())))
  const wallet = new Wallet(walletKeypair)

  context.config = config
  context.cluster = cluster
  context.provider = new AnchorProvider(connection, wallet, opts)
  context.keypair = walletKeypair

  context.metaplex = Metaplex.make(context.provider.connection)
    .use(keypairIdentity(context.keypair))
    .use(bundlrStorage({
      address: 'https://devnet.bundlr.network',
      providerUrl: context.provider.connection.rpcEndpoint,
      timeout: 60000,
    }))

  return context
}

export function useContext() {
  return context
}
