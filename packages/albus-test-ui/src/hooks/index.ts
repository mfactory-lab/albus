import type { MessageSignerWalletAdapterProps, SignerWalletAdapterProps } from '@solana/wallet-adapter-base'
import type { Ref } from 'vue'
import { computed } from 'vue'
import { useWallet } from 'solana-wallets-vue'
import type { PublicKey } from '@solana/web3.js'

export type AnchorWallet = {
  publicKey: PublicKey
  signMessage?: MessageSignerWalletAdapterProps['signMessage']
  signTransaction: SignerWalletAdapterProps['signTransaction']
  signAllTransactions: SignerWalletAdapterProps['signAllTransactions']
}

export function useAnchorWallet(): Ref<AnchorWallet | undefined> {
  const walletStore = useWallet()

  return computed<AnchorWallet | undefined>(() => {
    // Ensure the wallet store was initialised by a WalletProvider.
    if (!walletStore) {
      return
    }

    // Ensure the wallet is connected and supports the right methods.
    const { signMessage, signTransaction, signAllTransactions, publicKey } = walletStore
    if (
      !publicKey.value
      || !signTransaction.value
      || !signAllTransactions.value
    ) {
      return
    }

    return {
      publicKey: publicKey.value,
      signMessage: signMessage.value,
      signTransaction: signTransaction.value,
      signAllTransactions: signAllTransactions.value,
    }
  })
}
