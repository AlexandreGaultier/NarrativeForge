<script setup lang="ts">
// import ThemeToggle from './components/ThemeToggle.vue';
// Le routeur est déjà configuré dans main.ts
</script>

<template>
  <div id="app">
    <!-- <ThemeToggle /> -->
    <router-view></router-view>
  </div>
</template>

<style>
body {
  margin: 0;
  font-family: Arial, sans-serif;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  transition: background-color 0.3s ease, color 0.3s ease;
}

#app {
  min-height: 100vh;
}
</style>
