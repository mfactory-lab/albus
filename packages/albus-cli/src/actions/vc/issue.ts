import log from 'loglevel'
import { useContext } from '../../context'
import { exploreAddress } from '../../utils'
import { issueVerifiableCredential, mintVerifiableCredentialNFT } from './utils'

interface Opts {
  // provider: string
  encrypt: boolean
}

/**
 * Issue new Verifiable Credential
 */
export async function issue(opts: Opts) {
  const { keypair } = useContext()

  // Issue new Verifiable Credential
  const vc = await issueVerifiableCredential(keypair.publicKey, {
    encrypt: opts.encrypt,
  })

  // Generate new VC-NFT
  const nft = await mintVerifiableCredentialNFT(vc)

  log.info('Done')
  log.info(`Mint: ${nft.address}`)
  log.info(exploreAddress(nft.address))

  process.exit(0)
}
