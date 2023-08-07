import { useQuasar } from 'quasar'
import { useWallet } from 'solana-wallets-vue'
import { watch } from 'vue'
import { useEmitter } from './emitter'
import { shortenAddress } from '~/utils/web3'

export const WALLET_CONNECT_EVENT = Symbol('WALLET_CONNECT_EVENT')
export const WALLET_DISCONNECT_EVENT = Symbol('WALLET_DISCONNECT_EVENT')
export const ACCOUNT_CHANGE_EVENT = Symbol('ACCOUNT_CHANGE_EVENT')

const noticeTimeout = 5000

export function initWallet() {
  const { connection } = useConnectionStore()
  const { emit } = useEmitter()
  const { notify } = useQuasar()
  const { wallet } = useWallet()

  watch(
    wallet,
    (w) => {
      if (!w) {
        return
      }

      const onConnect = () => {
        const publicKey = w.adapter.publicKey!
        connection.onAccountChange(publicKey, (acc) => {
          console.log('ACCOUNT_CHANGE_EVENT', acc)
          emit(ACCOUNT_CHANGE_EVENT, acc)
        })
        connection.onLogs(publicKey, (logs) => {
          console.log(logs)
        })
        notify({
          message: 'Wallet update',
          caption: `Connected to wallet ${shortenAddress(publicKey.toBase58(), 7)}`,
          timeout: noticeTimeout,
        })
        emit(WALLET_CONNECT_EVENT, w)
      }

      const onDisconnect = () => {
        notify({
          message: 'Wallet update',
          caption: 'Disconnected from wallet',
          timeout: noticeTimeout,
        })
        emit(WALLET_DISCONNECT_EVENT, w)
      }

      const onError = (e: any) => {
        if (!e?.message) {
          return
        }
        notify({
          type: 'negative',
          message: 'Wallet update',
          caption: e.message,
          timeout: noticeTimeout,
        })
      }

      w.adapter.once('connect', onConnect)
      w.adapter.once('disconnect', onDisconnect)

      w.adapter.removeAllListeners('error')
      w.adapter.on('error', onError)
    },
    { immediate: true },
  )
}
