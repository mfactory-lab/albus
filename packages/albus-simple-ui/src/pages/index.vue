<script setup lang="ts">
import type { PublicKey } from '@solana/web3.js'

const albus = useAlbus()

const proving = ref(false)
async function prove(proofRequest: PublicKey) {
  proving.value = true
  try {
    console.log('Start proving...')
    await albus.client.value.proofRequest.fullProve({
      proofRequest,
      holderSecretKey: albus.state.holderSecretKey,
      vc: albus.state.creds[0].address,
    })
  } finally {
    proving.value = false
  }
}
</script>

<template>
  <div class="container">
    <div class="row">
      <div class="col">
        <h3>Creds ({{ albus.state.creds.length }})</h3>
        <q-spinner v-if="albus.state.credsLoading" size="50" />
        <div class="q-pa-md row items-start q-gutter-md">
          <q-card v-for="cred in albus.state.creds" :key="cred.address" flat bordered>
            <q-card-section>
              {{ cred.address }}
            </q-card-section>
            <q-separator inset />
            <q-card-section class="q-pt-none">
              <pre>{{ cred.credential.credentialSubject }}</pre>
            </q-card-section>
          </q-card>
        </div>
      </div>
      <div class="col">
        <h3>Requests ({{ albus.state.requests.length }})</h3>
        <q-spinner v-if="albus.state.requestsLoading" size="50" />
        <div class="q-pa-md row items-start q-gutter-md">
          <q-card v-for="req in albus.state.requests" :key="req.pubkey" flat bordered>
            <q-card-section>
              <q-btn v-if="req.data.status === 0" :loading="proving" color="primary" rounded @click="prove(req.pubkey)">
                prove
              </q-btn>
              {{ req.pubkey }}
            </q-card-section>
            <q-separator inset />
            <q-card-section class="q-pt-none">
              <pre>{{ req.data }}</pre>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
  </div>
</template>
