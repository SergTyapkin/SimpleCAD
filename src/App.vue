<template>
  <router-view />
</template>

<script setup>
</script>

<style lang="scss">
@use './styles/_colors.scss';
@import './styles/normalize.css';

body {
  margin: 0;
  padding: 0;
}

#app {
  height: 100vh;
  font-family: Helvetica, Arial, sans-serif;
  color: colors.$text;
}
</style>
