<template>
  <nav class="navbar">
    <div class="nav-content">
      <router-link to="/" class="nav-brand">
        NarrativeForge
      </router-link>
      
      <div class="nav-links">
        <router-link to="/books" class="nav-link">Bibliothèque</router-link>
        <router-link to="/books/new" class="nav-link">Nouveau Livre</router-link>
      </div>

      <div class="nav-actions">
        <ThemeToggle />
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import ThemeToggle from './ThemeToggle.vue';
</script>

<style scoped>
.navbar {
  background-color: var(--bg-secondary);
  box-shadow: var(--shadow);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-brand {
  font-family: 'Cinzel', serif;
  font-size: 1.5rem;
  color: var(--text-primary);
  text-decoration: none;
  font-weight: bold;
}

.nav-links {
  display: flex;
  gap: 2rem;
}

.nav-link {
  color: var(--text-secondary);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
}

.nav-link:hover {
  color: var(--accent-primary);
}

.nav-link.router-link-active {
  color: var(--accent-primary);
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}
</style> 