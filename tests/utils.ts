import type { Metaplex } from '@metaplex-foundation/js'
import { AnchorProvider, Wallet, web3 } from '@project-serum/anchor'
import type { PublicKeyInitData } from '@solana/web3.js'
import { PublicKey } from '@solana/web3.js'
import { assert } from 'chai'

export const payerKeypair = web3.Keypair.fromSecretKey(Uint8Array.from([46, 183, 156, 94, 55, 128, 248, 0, 49, 70, 183, 244, 178, 0, 0, 236, 212, 131, 76, 78, 112, 48, 25, 79, 249, 33, 43, 158, 199, 2, 168, 18, 55, 174, 166, 159, 57, 67, 197, 158, 255, 142, 177, 177, 47, 39, 35, 185, 148, 253, 191, 58, 219, 119, 104, 89, 225, 26, 244, 119, 160, 6, 156, 227]))

export function newProvider(payerKeypair: web3.Keypair) {
  const opts = AnchorProvider.defaultOptions()
  return new AnchorProvider(
    new web3.Connection('http://localhost:8899', opts),
    new Wallet(payerKeypair),
    opts,
  )
}

export const provider = newProvider(payerKeypair)

export async function mintNFT(metaplex: Metaplex, symbol: string) {
  const { nft } = await metaplex.nfts().create({
    uri: 'http://localhost/metadata.json',
    name: 'ALBUS NFT',
    symbol,
    sellerFeeBasisPoints: 500,
  })
  return nft
}

export async function airdrop(addr: PublicKeyInitData, amount = 10) {
  await provider.connection.confirmTransaction(
    await provider.connection.requestAirdrop(new PublicKey(addr), amount * web3.LAMPORTS_PER_SOL),
  )
}

export function assertErrorCode(error: { logs?: string[] }, code: string) {
  assert.ok(String((error?.logs ?? []).join('')).includes(`Error Code: ${code}`))
}
