import type { Commitment } from '@solana/web3.js'
import { clusterApiUrl } from '@solana/web3.js'
import type { Endpoint } from '@/stores/connection'

export const ENDPOINTS: Endpoint[] = [
  {
    id: 'helius-mainnet',
    name: 'Helius RPC',
    cluster: 'mainnet-beta',
    url: 'https://marketa-1sh8m6-fast-mainnet.helius-rpc.com/',
  },
  {
    id: 'mainnet',
    name: 'Solana RPC',
    cluster: 'mainnet-beta',
    url: clusterApiUrl('mainnet-beta'),
  },
  {
    id: 'devnet',
    name: 'DevNet',
    cluster: 'devnet',
    url: 'https://jody-hlb1qh-fast-devnet.helius-rpc.com/',
  },
]

export const DEFAULT_ENDPOINT = import.meta.env.DEV ? ENDPOINTS[1] : ENDPOINTS[0]

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
