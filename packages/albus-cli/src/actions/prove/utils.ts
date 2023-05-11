import { toBigNumber } from '@metaplex-foundation/js'
import type { PublicKey } from '@solana/web3.js'
import { Keypair } from '@solana/web3.js'
import log from 'loglevel'
import type { PublicSignals, SnarkjsProof } from 'snarkjs'
import { useContext } from '../../context'

/**
 * Mint `Proof` NFT
 */
export async function mintProofNFT(circuit: PublicKey, proof: SnarkjsProof, publicSignals: PublicSignals) {
  const { metaplex, config } = useContext()
  log.info('Uploading NFT metadata...')

  // TODO: Generate name by circuit ? Example: `ALBUS Age Proof`
  const name = 'ALBUS Proof'

  const { uri: metadataUri } = await metaplex
    .nfts()
    .uploadMetadata({
      name,
      image: config.logoUrl,
      external_url: config.nftExternalUrl,
      circuit: circuit.toBase58(),
      public_input: publicSignals,
      proof,
    })
  log.info('Done')
  log.info(`Metadata uri: ${metadataUri}`)

  const updateAuthority = Keypair.fromSecretKey(Uint8Array.from(config.issuerSecretKey))

  log.info('Minting new NFT...')
  const { nft } = await metaplex
    .nfts()
    .create({
      uri: metadataUri,
      name,
      sellerFeeBasisPoints: 0,
      symbol: `${config.nftSymbol}-P`,
      creators: config.nftCreators,
      isMutable: true,
      updateAuthority,
      maxSupply: toBigNumber(1),
    })

  return nft
}
