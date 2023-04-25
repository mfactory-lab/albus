import type { Keypair } from '@solana/web3.js'
import { PublicKey } from '@solana/web3.js'
import type { SMT } from 'circomlibjs'
import { buildPoseidon, newMemEmptyTrie } from 'circomlibjs'
import { crypto } from '@albus/core'
import { useContext } from '../context'

const { hash, edBabyJubJub } = crypto
const { arrayToBigInt } = crypto.utils

interface Opts {}

/**
 * Generate new Identity NFT
 */
export async function create(_opts: Opts) {
  const { keypair } = useContext()

  const identity = new Identity()
  identity.accounts = [
    {
      pubkey: new PublicKey('tiAmFd9rd4J3NE38VfP6QLihHpQa27diYvRXMWx1GdE'),
      meta: { name: 'Tiamo' },
    },
  ]

  const res = await identity.addAccount(keypair, { name: 'Test' })

  console.log(JSON.stringify(res))

  process.exit(0)
}

export class Identity {
  did: string | undefined
  accounts: IdentityAccount[] = []

  async hashAccount(pubkey: PublicKey): Promise<Uint8Array> {
    return hash.poseidon([pubkey.toBytes()])
  }

  async getAccountSMT(): Promise<SMT> {
    const tree = await newMemEmptyTrie()
    for (let key = 0; key < this.accounts.length; key++) {
      await tree.insert(key, await this.hashAccount(this.accounts[key].pubkey))
    }
    return tree
  }

  async addAccount(keypair: Keypair, meta?: IdentityAccountMeta) {
    const tree = await this.getAccountSMT()
    const newKey = this.accounts.push({ pubkey: keypair.publicKey, meta }) - 1
    const newValue = await this.hashAccount(keypair.publicKey)
    const res = await tree.insert(newKey, newValue)
    const sig = await signPoseidon(keypair.secretKey, [newValue])

    return {
      oldRoot: tree.F.toString(res.oldRoot),
      newRoot: tree.F.toString(res.newRoot),
      oldKey: tree.F.toString(res.oldKey),
      oldValue: tree.F.toString(res.oldValue),
      newValue: tree.F.toString(newValue),
      newKey,
      siblings: siblingsPad(res.siblings.map(s => tree.F.toString(s))),
      isOld0: res.isOld0 ? 1 : 0,
      // verification
      sig: sig.sig.map(v => arrayToBigInt(v).toString()),
      pubkey: sig.pubkey.map(v => arrayToBigInt(v).toString()),
      msg: arrayToBigInt(sig.hash).toString(),
    }
  }

  async deleteAccount(keypair: Keypair) {
    const tree = await this.getAccountSMT()
    const key = this.accounts.findIndex(p => p.pubkey.toBase58() === keypair.publicKey.toBase58())
    const res = await tree.delete(key)
    const sig = await signPoseidon(keypair.secretKey, [keypair.publicKey.toBytes()])

    return {
      ...res,
      sig,
    }
  }
}

interface IdentityAccountMeta {
  name: string
}

interface IdentityAccount {
  pubkey: PublicKey
  meta?: IdentityAccountMeta
}

const poseidonPromise = buildPoseidon()

export async function signPoseidon(secretKey: Uint8Array, inputs: Uint8Array[]) {
  const poseidon = await poseidonPromise
  const hash = poseidon(inputs)
  const [s, r8x, r8y] = await edBabyJubJub.signPoseidon(secretKey, hash)
  const pubkey = await edBabyJubJub.privateKeyToPublicKey(secretKey)
  return {
    sig: [r8x, r8y, s],
    pubkey,
    hash,
  }
}

function siblingsPad(siblings: any[], nLevels = 10) {
  while (siblings.length < nLevels) {
    siblings.push(0)
  }
  return siblings
}
