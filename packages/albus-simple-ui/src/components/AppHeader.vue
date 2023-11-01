<script setup lang="ts">
import logo from '@/assets/img/logo.svg'
</script>

<template>
  <div class="header">
    <div class="header-container container">
      <div class="header-logo">
        <img :src="logo" alt="logo">
      </div>
      <connect-wallet />
    </div>
  </div>
</template>

<style lang="scss">
.header {
  box-shadow: 0 0 3px 1px #0003;
  height: 88px;

  &-container {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &-logo {
    width: 74px;
    margin-top: 45px;

    img {
      width: 100%;
    }
  }
}
</style>
