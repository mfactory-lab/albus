import { credential } from '@mfactory-lab/albus-core'
import { useAnchorWallet, useWallet } from 'solana-wallets-vue'
import { Metaplex, bundlrStorage, toBigNumber, walletAdapterIdentity } from '@metaplex-foundation/js'
import { cloneDeep } from 'lodash-es'
import { Keypair } from '@solana/web3.js'
import { generateCredentialSubject } from '@/utils/credential'
import { ISSUER_SECRET_KEY, NFT_EXTERNAL_URL, NFT_LOGO_URL, NFT_SYMBOL } from '@/config'

export function useCredential() {
  const { notify } = useQuasar()
  const connectionStore = useConnectionStore()

  const isLoading = ref(false)

  const wallet = useAnchorWallet()
  const _w = useWallet()

  function notifyStatus(message: string, type = 'positive') {
    notify({ message, type })
  }

  const createTestVC = async () => {
    try {
      if (!wallet.value?.publicKey) {
        return
      }
      isLoading.value = true
      notifyStatus('Start creating VC')
      const claims = generateCredentialSubject()

      // Issue new Verifiable Credential
      const vc = await credential.createVerifiableCredential(claims, {
        issuerSecretKey: ISSUER_SECRET_KEY,
        encryptionKey: wallet.value?.publicKey,
        encrypt: true,
      })

      // Generate new VC-NFT
      await mintVerifiableCredentialNFT({ vc })
      notifyStatus('VC successfully created!')
    } catch (err) {
      console.log(err)
      notifyStatus(`[Error]: ${err}`, 'negative')
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Mint `VerifiableCredential` NFT
   */
  async function mintVerifiableCredentialNFT(payload: { [key: string]: any }) {
    if (!wallet.value) {
      return
    }
    const name = 'ALBUS Verifiable Credential'

    const _wallet = { ...cloneDeep(wallet.value), signMessage: _w.signMessage.value }

    const metaplex = Metaplex.make(connectionStore.connection)
      .use(walletAdapterIdentity(_wallet))
      .use(bundlrStorage({
        address: 'https://devnet.bundlr.network',
        providerUrl: connectionStore.connection.rpcEndpoint,
        timeout: 60000,
      }))

    const { uri: metadataUri } = await metaplex
      .nfts()
      .uploadMetadata({
        name,
        image: NFT_LOGO_URL,
        external_url: NFT_EXTERNAL_URL,
        ...payload,
      })

    const keyPair = Keypair.fromSecretKey(new Uint8Array(ISSUER_SECRET_KEY))

    const updateAuthority = keyPair

    const { nft } = await metaplex
      .nfts()
      .create({
        uri: metadataUri,
        name,
        sellerFeeBasisPoints: 0,
        symbol: `${NFT_SYMBOL}-VC`,
        creators: [],
        isMutable: true,
        updateAuthority,
        maxSupply: toBigNumber(1),
      })

    return nft
  }

  return { createTestVC, isLoading }
}
