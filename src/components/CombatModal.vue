<template>
  <div v-if="show" class="combat-modal-backdrop">
    <div class="combat-modal">
      <h2>Combat !</h2>
      <div class="combat-flex">
        <div class="combat-col">
          <h3>Joueur</h3>
          <div class="combat-stat">Nom : <b>{{ character.name }}</b></div>
          <div class="combat-stat">HP : <b>{{ character.hp }}</b></div>
        </div>
        <div class="combat-col">
          <h3>Monstre</h3>
          <div class="combat-stat">Nom : <input v-model="monster.name" class="monster-input" /></div>
          <div class="combat-stat">HP : <input v-model.number="monster.hp" type="number" min="1" class="monster-input" /></div>
          <div class="combat-stat">ATQ : <input v-model.number="monster.atq" type="number" min="1" class="monster-input" /></div>
        </div>
      </div>
      <div class="combat-actions">
        <button @click="attack" :disabled="monster.hp <= 0 || character.hp <= 0">Attaquer</button>
        <button @click="$emit('close')">Fermer</button>
      </div>
      <div v-if="lastResult" class="combat-result">{{ lastResult }}</div>
      <div v-if="monster.hp <= 0" class="combat-victory">Victoire ! Le monstre est vaincu.</div>
      <div v-if="character.hp <= 0" class="combat-defeat">Défaite... Vous êtes K.O.</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, reactive } from 'vue';
import type { Character } from '../types';

const props = defineProps<{
  show: boolean;
  character: Character;
}>();
const emit = defineEmits(['close', 'update:character']);

const monster = reactive({
  name: 'Gobelin',
  hp: 20,
  atq: 3
});
const lastResult = ref('');

watch(() => props.show, (val) => {
  if (val) {
    monster.hp = 20;
    lastResult.value = '';
  }
});

function attack() {
  if (monster.hp <= 0 || props.character.hp <= 0) return;
  const playerRoll = Math.floor(Math.random() * 20) + 1;
  if (playerRoll >= 10) {
    monster.hp -= 5;
    lastResult.value = `Vous attaquez (d20=${playerRoll}) : Réussi ! -5 HP au monstre.`;
  } else {
    lastResult.value = `Vous attaquez (d20=${playerRoll}) : Raté !`;
  }
  if (monster.hp > 0) {
    setTimeout(() => {
      const monsterAttack = Math.random() < 0.5;
      if (monsterAttack) {
        emit('update:character', { ...props.character, hp: props.character.hp - monster.atq });
        lastResult.value += `\nLe monstre attaque : -${monster.atq} HP !`;
      } else {
        lastResult.value += `\nLe monstre attaque : Il rate !`;
      }
    }, 500);
  }
}
</script>

<style scoped>
.combat-modal-backdrop {
  position: fixed;
  left: 0; top: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.6);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}
.combat-modal {
  background: var(--bg-secondary);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
  padding: 2rem 2.5rem;
  min-width: 320px;
  max-width: 95vw;
  color: var(--text-primary);
  display: flex;
  flex-direction: column;
  align-items: center;
}
.combat-flex {
  display: flex;
  gap: 2.5rem;
  margin-bottom: 1.5rem;
}
.combat-col {
  background: var(--card-bg);
  border-radius: var(--border-radius);
  padding: 1rem 1.5rem;
  min-width: 120px;
  box-shadow: var(--shadow);
}
.combat-stat {
  margin-bottom: 0.5rem;
}
.combat-actions {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}
.combat-actions button {
  background: var(--accent-primary);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  padding: 0.5rem 1.2rem;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
}
.combat-actions button:disabled {
  background: #888;
  cursor: not-allowed;
}
.combat-result {
  margin-top: 0.5rem;
  white-space: pre-line;
  color: var(--accent-secondary);
  font-size: 1.05rem;
  text-align: center;
}
.combat-victory {
  color: #4caf50;
  font-weight: bold;
  margin-top: 1rem;
}
.combat-defeat {
  color: #f44336;
  font-weight: bold;
  margin-top: 1rem;
}
.monster-input {
  background: var(--card-bg);
  color: var(--text-primary);
  border: 1px solid var(--accent-primary);
  border-radius: 6px;
  padding: 0.2rem 0.5rem;
  font-size: 1rem;
  width: 70px;
  margin-left: 0.3rem;
}
.monster-input[type="number"] {
  width: 50px;
}
</style> 