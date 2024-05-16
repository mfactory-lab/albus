<script setup lang="ts">
import { useWallet } from 'solana-wallets-vue'
import type { Wallet } from 'solana-wallets-vue/dist/types'

defineProps({
  isShorten: {
    type: Boolean,
    default: true,
  },
  length: {
    type: Number,
    default: 4,
  },
})

// custom wallet sort order
type WalletSettings = {
  priority: Record<string, number>
  deepLinks: Record<string, string>
}

// Customize wallets
const settings: WalletSettings = {
  priority: {
    solflare: 10,
    phantom: 20,
    sollet: 5,
    nufi: 5,
    blocto: 1,
  },
  deepLinks: {
    phantom: 'https://phantom.app/ul/browse/{uri}?ref={ref}',
    solflare: 'solflare://ul/v1/browse/{uri}?ref={ref}',
  },
}

const wallet = useWallet()
const route = useRoute()
const { connected, connecting } = wallet

function isActiveWallet(w: Wallet) {
  return ['Installed', 'Loadable'].includes(
    w.readyState,
  )
}

const isMobile = computed(() => false)

type ExtendedWallet = Wallet & { icon: string, darkIcon: string, deepLink: string }
const walletAddress = computed(() => wallet.publicKey.value?.toBase58() ?? '')
const walletAddressByScreen = computed(() => walletAddress.value)
const walletShortAddress = computed(() => walletAddress.value)
const wallets = computed<ExtendedWallet[]>(() =>
  [...wallet.wallets.value as ExtendedWallet[]]
    .map((w) => {
      const key = w.adapter.name.toLowerCase().replace(/\s/g, '')
      // only show deep links on mobile
      if (isMobile.value && settings.deepLinks[key]) {
        w.deepLink = settings.deepLinks[key]!
          .replace('{uri}', encodeURIComponent(location.href))
          .replace('{ref}', encodeURIComponent(location.origin))
          .replace('{host}', location.host)
      }
      return w
    })
    .sort((a, b) => {
      const aPriority = settings.priority[a.adapter.name.toLowerCase()] ?? 1
      const bPriority = settings.priority[b.adapter.name.toLowerCase()] ?? 1
      return (
        bPriority
        - aPriority
        + ((isActiveWallet(b) ? 1 : 0) - (isActiveWallet(a) ? 1 : 0))
      )
    }),
)

const computedWallets = computed(() => {
  return isMobile.value ? wallets.value.filter(w => !!w.deepLink) : wallets.value
})

const dialog = ref(false)

async function select(w: any) {
  await wallet.select(w.adapter.name)
  dialog.value = false
  await wallet.connect()
}

function disconnect() {
  dialog.value = false
  wallet.disconnect()
}

function show() {
  if (!connected.value && computedWallets.value.length === 1 && computedWallets.value[0]) {
    select(computedWallets.value[0])
  } else {
    dialog.value = true
  }
}

function ok() {
  dialog.value = false
}

const moreWalletsForMobile = ref(false)

onMounted(() => {
  if (isMobile.value && route.name !== 'index') {
    const btn = document.querySelector('.connect-button') as HTMLElement
    btn?.click()
  }
})
</script>

<template>
  <q-btn
    v-if="connected" v-bind="$attrs" :class="$style.btn" :ripple="false" rounded
    class="connect-button" unelevated @click="show"
  >
    {{ walletShortAddress }}
  </q-btn>

  <q-btn
    v-else v-bind="$attrs" unelevated :ripple="false" :loading="connecting" class="connect-button"
    @click="show"
  >
    Connect Wallet
  </q-btn>

  <q-dialog
    v-model="dialog" transition-duration="100" transition-show="fade" transition-hide="fade"
    @hide="moreWalletsForMobile = false"
  >
    <q-card v-if="connected">
      <q-card-section class="relative-position">
        <div class="text-h6 text-center" style="text-transform: uppercase;">
          Wallet
        </div>
        <q-btn
          padding="md" color="transparent" text-color="primary-gray" unelevated
          class="absolute-right close-wallet-btn" size="md" @click="ok"
        >
          x
        </q-btn>
      </q-card-section>
      <q-separator />
      <q-card-section>
        <copy-to-clipboard :text="walletAddress" />
        {{ walletAddressByScreen }}
      </q-card-section>
      <q-separator />
      <q-card-section>
        <div class="q-gutter-md row justify-between">
          <q-btn outline rounded @click="disconnect">
            disconnect
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
          Select Wallet
        </div>
        <q-btn
          padding="md" color="transparent" text-color="primary-gray" unelevated class="absolute-right"
          size="md" @click="ok"
        />
      </q-card-section>
      <q-separator />
      <q-card-section style="max-height: 80vh" class="scroll">
        <q-table grid :rows="computedWallets" row-key="name" hide-pagination hide-header :rows-per-page-options="[100]">
          <template #item="{ row: w }">
            <div
              v-if="w.adapter.name === 'Solflare' && isMobile && !moreWalletsForMobile"
              class="col-12 col-md-6 q-my-sm text-center"
            >
              <q-btn unelevated class="more-btn" @click="moreWalletsForMobile = !moreWalletsForMobile">
                {{ moreWalletsForMobile ? 'Less' : 'More' }}
              </q-btn>
            </div>
            <span
              v-if="moreWalletsForMobile && w.adapter.name === 'Solflare'" data-name="solflare-warning"
            >solflare</span>
            <div
              v-if="(moreWalletsForMobile || w.adapter.name !== 'Solflare') || !isMobile" :key="`wallet-${w.name}`"
              class="col-12 col-md-6"
            >
              <q-item clickable :href="w.deepLink" @click="w.deepLink ? true : select(w)">
                <q-item-section>
                  <b>{{ w.adapter.name }}</b>
                  <div
                    class="text-light-gray text-caption full-width text-no-wrap"
                    style="text-overflow: ellipsis; overflow: hidden"
                  >
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
span[data-name="solflare-warning"] {
  font-size: 12px;
  padding: 10px;
}

.more-btn {
  border: 1px solid #f5f5f5;
  font-size: 14px;
}

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

  img {
    height: 0.6em;
    margin-right: 0.2em;
  }
}
</style>
