import { LAMPORTS_PER_SOL, PublicKey, clusterApiUrl } from '@solana/web3.js'
import type { Cluster, PublicKeyInitData, Transaction } from '@solana/web3.js'
import * as anchor from '@project-serum/anchor'
import { useContext } from '../context'

export function clusterUrl(c: Cluster) {
  switch (c) {
    case 'mainnet-beta':
      return 'https://solana-api.projectserum.com/'
    case 'testnet':
      return 'https://testnet.rpcpool.com'
  }
  return clusterApiUrl(c as any)
}

function exploreLink(id: string, opts: { type: 'tx' | 'address'; cluster?: Cluster }) {
  return `https://explorer.solana.com/${opts.type}/${id}?cluster=${opts.cluster ?? 'mainnet-beta'}`
}

export function exploreAddress(addr: PublicKeyInitData) {
  const { cluster } = useContext()
  return exploreLink(new PublicKey(addr).toString(), { type: 'address', cluster })
}

export function exploreTransaction(signature: string) {
  const { cluster } = useContext()
  return exploreLink(signature, { type: 'tx', cluster })
}

/**
 * Generates a link for inspecting the contents
 */
export function inspectTransaction(tx: Transaction, cluster: Cluster = 'mainnet-beta') {
  tx.recentBlockhash = PublicKey.default.toString()
  const base64 = tx.serializeMessage().toString('base64')
  return {
    base64,
    url: `https://explorer.solana.com/tx/inspector?cluster=${cluster}&message=${encodeURIComponent(
      base64,
    )}`,
  }
}

export function lamportsToSol(lamports: number | anchor.BN): number {
  if (typeof lamports === 'number') {
    return Math.abs(lamports) / LAMPORTS_PER_SOL
  }
  let signMultiplier = 1
  if (lamports.isNeg()) {
    signMultiplier = -1
  }
  const absLamports = lamports.abs()
  const lamportsString = absLamports.toString(10).padStart(10, '0')
  const splitIndex = lamportsString.length - 9
  const solString = `${lamportsString.slice(0, splitIndex)}.${lamportsString.slice(splitIndex)}`
  return signMultiplier * parseFloat(solString)
}

export function solToLamports(amount: number): number {
  if (isNaN(amount)) {
    return Number(0)
  }
  return new anchor.BN(amount.toFixed(9).replace('.', '')).toNumber()
}
