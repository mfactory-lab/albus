import { MetadataV1GpaBuilder } from '@metaplex-foundation/js'
import { Keypair } from '@solana/web3.js'
import { useContext } from '../../context'

export async function showAll() {
  const { metaplex, config } = useContext()

  const albusKeypair = Keypair.fromSecretKey(Uint8Array.from(config.issuerSecretKey))

  const gpaBuilder = new MetadataV1GpaBuilder(metaplex)

  const nfts = gpaBuilder
    .whereSymbol(`${config.nftSymbol}-VC`)
    .whereUpdateAuthority(albusKeypair.publicKey).get()

  console.log(nfts)
}
