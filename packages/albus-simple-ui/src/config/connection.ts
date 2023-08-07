import type { Commitment } from '@solana/web3.js'

// import { clusterApiUrl } from '@solana/web3.js'
import type { Endpoint } from '@/stores'
import { getJFRpcToken } from '@/utils/rpc'

export const ENDPOINTS: Endpoint[] = [
  {
    id: 'jfactory-mainnet',
    name: 'JFactory RPC',
    cluster: 'mainnet-beta',
    url: import.meta.env.DEV
      ? 'https://restless-blue-valley.solana-mainnet.quiknode.pro/388d47063172de995210b42f44a3483d4269dcf9/'
      : 'https://rpc.jfactory.ch/',
    wsEndpoint: import.meta.env.DEV ? undefined : 'wss://sleek-solemn-rain.solana-mainnet.quiknode.pro/1bac3b4146d57810e23b4263129fda9dbff83fe9/',
    getToken: getJFRpcToken,
  },
  {
    id: 'serum-mainnet',
    name: 'Serum RPC',
    cluster: 'mainnet-beta',
    url: 'https://solana-api.projectserum.com/',
  },
  {
    id: 'rpcpool-mainnet',
    name: 'RPCPool RPC',
    cluster: 'mainnet-beta',
    url: 'https://mainnet.rpcpool.com/',
  },
  /* {
    id: 'mainnet',
    name: 'Solana RPC',
    cluster: 'mainnet-beta',
    url: clusterApiUrl('mainnet-beta'),
  }, */
  {
    id: 'testnet',
    name: 'TestNet',
    cluster: 'testnet',
    url: 'https://testnet.rpcpool.com/',
  },
  {
    id: 'devnet',
    name: 'DevNet',
    cluster: 'devnet',
    url: 'https://devnet.rpcpool.com/',
  },
]

export const DEFAULT_ENDPOINT = ENDPOINTS[0] as Endpoint

/**
 * The level of commitment desired when querying state
 * <pre>
 *   'processed': Query the most recent block which has reached 1 confirmation by the connected node
 *   'confirmed': Query the most recent block which has reached 1 confirmation by the cluster
 *   'finalized': Query the most recent block which has been finalized by the cluster
 * </pre>
 */
export const DEFAULT_COMMITMENT: Commitment = 'confirmed'

export const DEFAULT_MONITOR_COMMITMENT: Commitment = 'processed'

export const DEFAULT_SEND_TIMEOUT = 15000

/**
 * Time to allow for the server to initially process a transaction (in milliseconds)
 */
export const DEFAULT_CONFIRM_TIMEOUT = 120000
