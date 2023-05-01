import { toBigNumber } from '@metaplex-foundation/js'
import { Keypair } from '@solana/web3.js'
import log from 'loglevel'
import { useContext } from '../../context'

interface Opts {}

/**
 * Generate new Identity NFT
 */
export async function create(_opts: Opts) {
  const { keypair, metaplex, config } = useContext()

  // const identity = new Identity()
  // identity.accounts = [
  //   {
  //     pubkey: new PublicKey('tiAmFd9rd4J3NE38VfP6QLihHpQa27diYvRXMWx1GdE'),
  //     meta: { name: 'Tiamo' },
  //   },
  // ]
  //
  // const res = await identity.addAccount(keypair, { name: 'Test' })
  // console.log(JSON.stringify(res))

  const name = 'ALBUS Identity'

  const { uri: metadataUri } = await metaplex
    .nfts()
    .uploadMetadata({
      name,
      image: config.logoUrl,
      external_url: config.nftExternalUrl,
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
      symbol: `${config.nftSymbol}-ID`,
      creators: config.nftCreators,
      isMutable: true,
      updateAuthority,
      maxSupply: toBigNumber(1),
    })

  log.info('Done')
  log.info(`Mint: ${nft.address}`)

  process.exit(0)
}
