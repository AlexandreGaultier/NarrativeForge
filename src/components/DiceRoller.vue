<template>
  <div class="dice-roller">
    <h3>Lancer de dés</h3>
    <div class="dice-controls">
      <select v-model.number="selectedDie" class="dice-select">
        <option v-for="die in diceTypes" :key="die" :value="die">d{{ die }}</option>
      </select>
      <select v-model.number="diceCount" class="dice-count-select">
        <option v-for="n in 5" :key="n" :value="n">{{ n }} dé{{ n > 1 ? 's' : '' }}</option>
      </select>
      <button @click="rollDice" class="roll-btn">Lancer</button>
    </div>
    <transition-group name="dice-fade" tag="div" class="dice-results" v-if="results.length">
      <div v-for="(res, i) in results" :key="'current-'+i" class="dice-face" :class="{ animate: animate }">
        {{ res }}
      </div>
    </transition-group>
    <div v-if="results.length" class="total">Total : <span class="total-value">{{ results.reduce((a, b) => a + b, 0) }}</span></div>
    <div v-if="history.length > 0" class="history">
      <div class="history-title">Historique :</div>
      <div class="history-row" v-for="(h, i) in history" :key="i">
        <span class="history-dice">{{ h.count }}d{{ h.die }}</span> →
        <span class="history-values">
          <span v-for="(v, j) in h.values" :key="j" class="history-value">{{ v }}</span>
        </span>
        <span class="history-total">(Total: {{ h.values.reduce((a, b) => a + b, 0) }})</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue';

const diceTypes = [4, 6, 8, 10, 12, 20];
const selectedDie = ref(6);
const diceCount = ref(1);
const results = ref<number[]>([]);
const animate = ref(false);
const history = ref<{die: number, count: number, values: number[]}[]>([]);

async function rollDice() {
  animate.value = false;
  await nextTick();
  animate.value = true;
  results.value = [];
  setTimeout(() => {
    const rollResults = Array.from({ length: diceCount.value }, () => Math.floor(Math.random() * selectedDie.value) + 1);
    results.value = rollResults;
    history.value.unshift({ die: selectedDie.value, count: diceCount.value, values: rollResults });
    if (history.value.length > 3) history.value = history.value.slice(0, 3);
    animate.value = false;
  }, 350);
}
</script>

<style scoped>
.dice-roller {
  background-color: var(--bg-secondary);
  padding: 1.2rem 1rem;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
  margin-top: 1.2rem;
}

h3 {
  font-family: 'Cinzel', serif;
  color: var(--text-primary);
  margin-top: 0.2rem;
  margin-bottom: 0.5rem;
  font-size: 1.2rem;
}

.dice-controls {
  display: flex;
  gap: 0.7rem;
  align-items: center;
  margin-bottom: 1rem;
}

.dice-select, .dice-count-select {
  padding: 0.3rem 0.7rem;
  border-radius: var(--border-radius);
  border: 1px solid var(--text-secondary);
  background: var(--card-bg);
  color: var(--text-primary);
  font-size: 0.95rem;
}

.roll-btn {
  background-color: var(--accent-primary);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  padding: 0.3rem 1rem;
  cursor: pointer;
  font-size: 0.95rem;
  transition: background 0.2s;
}

.roll-btn:hover {
  background-color: var(--accent-secondary);
}

.dice-results {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.7rem;
  justify-content: flex-start;
  flex-wrap: wrap;
}

.dice-face {
  width: 36px;
  height: 36px;
  background: linear-gradient(145deg, var(--accent-primary) 60%, var(--accent-secondary) 100%);
  color: white;
  font-size: 1.3rem;
  font-family: 'Cinzel', serif;
  font-weight: bold;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px 0 rgba(0,0,0,0.13);
  position: relative;
  animation: none;
  transition: transform 0.2s;
}

.dice-face.animate {
  animation: shake 0.35s cubic-bezier(.36,.07,.19,.97) both;
}

@keyframes shake {
  10%, 90% { transform: translateX(-2px); }
  20%, 80% { transform: translateX(4px); }
  30%, 50%, 70% { transform: translateX(-8px); }
  40%, 60% { transform: translateX(8px); }
}

.total {
  font-size: 1rem;
  color: var(--accent-primary);
  margin-bottom: 0.5rem;
}

.total-value {
  font-weight: bold;
  font-size: 1.1rem;
}

.history {
  margin-top: 0.5rem;
}

.history-title {
  color: var(--text-secondary);
  font-size: 0.92rem;
  margin-bottom: 0.1rem;
}

.history-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.97rem;
  margin-bottom: 0.1rem;
  padding-left: 0.1rem;
}

.history-dice {
  font-weight: bold;
  color: var(--accent-primary);
  font-size: 0.98rem;
}

.history-values {
  display: inline-flex;
  gap: 0.2rem;
  margin-left: 0.2rem;
}

.history-value {
  background: var(--card-bg);
  color: var(--text-primary);
  border-radius: 5px;
  padding: 0.05rem 0.35rem;
  font-weight: bold;
  font-size: 0.95rem;
}

.history-total {
  margin-left: 0.4rem;
  color: var(--accent-secondary);
  font-size: 0.92rem;
  font-weight: 500;
}

@media (max-width: 600px) {
  .dice-results {
    gap: 0.3rem;
  }
  .dice-face {
    width: 28px;
    height: 28px;
    font-size: 1rem;
  }
  .history-row {
    font-size: 0.92rem;
    gap: 0.3rem;
  }
}
</style> 