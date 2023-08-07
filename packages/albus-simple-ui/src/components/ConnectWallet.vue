<script setup lang="ts">
import { useWallet } from 'solana-wallets-vue'
import { evaClose } from '@quasar/extras/eva-icons'
import { shortenAddress } from '@/utils/web3'

// custom wallet sort order
const walletPriority: Record<string, number> = {
  solflare: 10,
  phantom: 20,
  sollet: 5,
  nufi: 5,
  blocto: 1,
}

const icons = {
  close: evaClose,
}

const router = useRouter()
const wallet = useWallet()
const { connected, connecting } = wallet

const walletAddress = computed(() => wallet.publicKey.value?.toBase58() ?? '')
const walletShortAddress = computed(() => shortenAddress(walletAddress.value))
const wallets = computed(() =>
  [...wallet.wallets.value]
    .sort((a, b) => {
      const aPriority = walletPriority[a.adapter.name.toLowerCase()] ?? 1
      const bPriority = walletPriority[b.adapter.name.toLowerCase()] ?? 1
      return (
        bPriority - aPriority + 1
      )
    }),
)

const dialog = ref(false)

async function select(w: any) {
  await wallet.select(w.adapter.name)
  dialog.value = false
  await wallet.connect()
}

function disconnect() {
  dialog.value = false
  wallet.disconnect()
  router.push('/')
}

function show() {
  dialog.value = true
}

function ok() {
  dialog.value = false
}
</script>

<template>
  <q-btn v-if="connected" v-bind="$attrs" :class="$style.btn" :ripple="false" text-color="white" rounded
    class="connect-button" unelevated @click="show">
    {{ walletShortAddress }}
  </q-btn>

  <q-btn v-else v-bind="$attrs" text-color="white" :class="$style.btn" unelevated :ripple="false" :loading="connecting"
    class="connect-button" @click="show">
    CONNECT WALLET
  </q-btn>

  <q-dialog v-model="dialog" transition-duration="100" transition-show="fade" transition-hide="fade">
    <q-card v-if="connected">
      <q-card-section class="relative-position">
        <div class="text-h6 text-center">
          Your wallet
        </div>
        <q-btn padding="md" color="transparent" text-color="primary-gray" unelevated
          class="absolute-right close-wallet-btn" :icon="icons.close" size="md" @click="ok" />
      </q-card-section>

      <q-separator />
      <q-card-section>
        <copy-to-clipboard :text="walletAddress" />
        {{ walletAddress }}
      </q-card-section>
      <q-separator />
      <q-card-section>
        <div class="q-gutter-md row justify-between">
          <q-btn outline rounded @click="disconnect">
            Disconnect
          </q-btn>
          <q-btn outline rounded @click="ok">
            Ok
          </q-btn>
        </div>
      </q-card-section>
    </q-card>

    <q-card v-else class="wallet-connect-card">
      <q-card-section>
        <div class="text-h6">
          Connect to a wallet
        </div>
        <q-btn padding="md" color="transparent" text-color="primary-gray" unelevated class="absolute-right"
          :icon="icons.close" size="md" @click="ok" />
      </q-card-section>
      <q-separator />
      <q-card-section style="max-height: 80vh" class="scroll">
        <q-table grid :rows="wallets" row-key="name" hide-pagination hide-header :rows-per-page-options="[100]">
          <template #item="{ row: w }">
            <div :key="`wallet-${w.name}`" class="col-12 col-md-6">
              <q-item clickable @click="select(w)">
                <q-item-section>
                  <b>{{ w.adapter.name }}</b>
                  <div class="text-light-gray text-caption full-width text-no-wrap"
                    style="text-overflow: ellipsis; overflow: hidden">
                    {{ w.adapter.url }}
                  </div>
                </q-item-section>
                <q-item-section avatar>
                  <q-avatar square>
                    <img :src="w.adapter.icon" :alt="w.adapter.name">
                  </q-avatar>
                </q-item-section>
              </q-item>
            </div>
          </template>
        </q-table>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<style scoped lang="scss">
.wallet-connect-card {
  .q-item {
    border: 1px solid #f5f5f5;
    margin: 3px;

    b {
      font-weight: 500;
    }

    &:hover {
      border-color: #e8e8e8;
    }
  }
}

.close-wallet-btn {
  border-radius: 50%;
  width: 36px;
  height: 36px;
  padding: 0 !important;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  right: 10px;
}
</style>

<style lang="scss" module>
.btn {
  white-space: nowrap;
  flex-wrap: nowrap;
  background-color: $primary !important;

  img {
    height: 0.6em;
    margin-right: 0.2em;
  }
}
</style>
