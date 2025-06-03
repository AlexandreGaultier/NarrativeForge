<template>
  <div class="character-sheet">
    <h2>Fiche de Personnage</h2>
    
    <div class="character-info">
      <div class="info-group">
        <label>Nom</label>
        <div class="value">{{ character.name }}</div>
      </div>

      <div class="info-group">
        <label>Points de Vie</label>
        <div class="value">{{ character.hp }}</div>
      </div>

      <div class="info-group">
        <label>Or</label>
        <div class="value">{{ character.gold }}</div>
      </div>

      <template v-if="character.stats">
        <div v-for="(value, stat) in character.stats" 
              :key="stat" 
              class="info-group">
          <label>{{ formatStatName(stat) }}</label>
          <div class="value">{{ value }}</div>
        </div>
      </template>
    </div>

    <div class="inventory" v-if="character.inventory.length > 0">
      <h3>Inventaire</h3>
      <div class="inventory-list">
        <div v-for="item in character.inventory" 
              :key="item.name" 
              class="inventory-item">
          <div class="item-name">{{ item.name }}</div>
          <div class="item-description">{{ item.description }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Character } from '../types';

const props = defineProps<{
  character: Character;
}>();

const formatStatName = (stat: string) => {
  return stat.charAt(0).toUpperCase() + stat.slice(1).toLowerCase();
};
</script>

<style scoped>
.character-sheet {
  background-color: var(--bg-secondary);
  padding: 1.5rem;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
}

h2 {
  font-family: 'Cinzel', serif;
  margin-bottom: 1.5rem;
  color: var(--text-primary);
}

.character-info {
  display: grid;
  gap: 1rem;
  margin-bottom: 2rem;
}

.info-group {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background-color: var(--card-bg);
  border-radius: var(--border-radius);
}

.info-group label {
  color: var(--text-secondary);
  font-weight: 500;
}

.info-group .value {
  color: var(--text-primary);
  font-weight: bold;
}

.inventory {
  margin-top: 2rem;
}

.inventory h3 {
  font-family: 'Cinzel', serif;
  margin-bottom: 1rem;
  color: var(--text-primary);
}

.inventory-list {
  display: grid;
  gap: 1rem;
}

.inventory-item {
  background-color: var(--card-bg);
  padding: 1rem;
  border-radius: var(--border-radius);
}

.item-name {
  font-weight: bold;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.item-description {
  color: var(--text-secondary);
  font-size: 0.9rem;
}
</style> 