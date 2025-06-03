<template>
  <button class="theme-toggle" @click="toggleTheme">
    {{ isDark ? '☀️' : '🌙' }}
  </button>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const isDark = ref(false);

onMounted(() => {
  // Vérifier la préférence système
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  // Vérifier le thème sauvegardé
  const savedTheme = localStorage.getItem('theme');
  
  if (savedTheme) {
    isDark.value = savedTheme === 'dark';
  } else {
    isDark.value = prefersDark;
  }
  
  updateTheme();
});

const toggleTheme = () => {
  isDark.value = !isDark.value;
  updateTheme();
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light');
};

const updateTheme = () => {
  document.documentElement.setAttribute('data-theme', isDark.value ? 'dark' : 'light');
};
</script>

<style scoped>
.theme-toggle {
  position: fixed;
  top: 1rem;
  right: 1rem;
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: none;
  box-shadow: var(--shadow);
  transition: transform 0.2s ease;
}

.theme-toggle:hover {
  transform: scale(1.1);
}
</style> 