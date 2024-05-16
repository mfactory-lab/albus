<script setup lang="ts">
import './style.css'
import { AlbusClient } from '@albus-finance/sdk'

const connectionStore = useConnectionStore()
const wallet = useAnchorWallet()

async function upload() {
  const client = AlbusClient.fromWallet(connectionStore.connection, wallet.value)

  const res = await client.storage.upload(Buffer.from([1, 2, 3]))

  console.log(res)
}
</script>

<template>
  <div class="container content">
    <main>
      <ClusterSelector />
      <ConnectWallet />

      <br>
      <br>

      <q-btn @click="upload">
        upload
      </q-btn>
    </main>
  </div>
</template>
