<script setup lang="ts">
import './assets/styles/main.scss'

useHead({
  title: import.meta.env.VITE_APP_TITLE,
  meta: [
    { name: 'description', content: import.meta.env.VITE_APP_DESCRIPTION },
    { name: 'keywords', content: import.meta.env.VITE_APP_KEYWORDS },
  ],
})

/* onBeforeMount(() => {
  initWallet()
}) */
</script>

<template>
  <router-view />
</template>
