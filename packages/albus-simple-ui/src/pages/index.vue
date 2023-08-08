<script setup lang="ts">
const albus = useAlbus()

albus.client.credential.loadAll().then((res) => {
  console.log('creds', res)
})
</script>

<template>
  main page
</template>
