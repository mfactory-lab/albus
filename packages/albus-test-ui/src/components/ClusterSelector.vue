<script setup lang="ts">
import { useWallet } from "solana-wallets-vue";
import type { Endpoint } from "@/stores/connection";
import { ENDPOINTS } from "@/config";

const connectionStore = useConnectionStore();
const { connected, connect, disconnect, autoConnect } = useWallet();



const groups = [
  ENDPOINTS.filter((e) => e.cluster === "mainnet-beta"),
  ENDPOINTS.filter((e) => e.cluster !== "mainnet-beta"),
];

const endpoint = computed(() => connectionStore.endpoint);

function select(e: Endpoint) {
  if (connected && connectionStore.cluster !== e.cluster) {
    disconnect();
    if (autoConnect.value) {
      connect();
    }
  }
  connectionStore.setRpc(e.id);
}
</script>

<template>
  <q-btn-dropdown
    :label="endpoint.name"
    :model-value="false"
    auto-close
    text-color="black"
    unelevated
    class="cluster-selector"
    content-class="cluster-selector__menu"
    :ripple="false"
  >
    <q-list>
      <template
        v-for="(items, index) in groups"
        :key="`${index}-cluster-group`"
      >
        <q-item
          v-for="item in items"
          :key="item.id"
          clickable
          @click="select(item)"
        >
          <q-item-section :key="`${item.id}-item`">
            <q-item-label>
              <b>{{ item.cluster }}</b>
            </q-item-label>
            <!-- {{ item.url }} -->
          </q-item-section>
        </q-item>
        <q-separator v-if="index !== groups.length - 1" />
      </template>
    </q-list>
  </q-btn-dropdown>
</template>
