<template>
  <div class="book-reader">
    <div class="reader-container">
      <div class="chapter-content" v-if="currentChapter">
        <h1>{{ currentChapter.title }}</h1>
        <div class="text">{{ currentChapter.text }}</div>
        
        <div class="choices" v-if="currentChapter.next.length > 0">
          <button v-for="nextId in currentChapter.next" 
                  :key="nextId"
                  @click="goToChapter(nextId)"
                  class="choice-button">
            {{ getChapterTitle(nextId) }}
          </button>
        </div>
      </div>

      <div class="character-sheet-container">
        <CharacterSheet :character="playerCharacter" />
        <DiceRoller />
        <button class="combat-btn" @click="showCombatModal = true">Lancer un combat</button>
        <CombatModal
          :show="showCombatModal"
          :character="playerCharacter"
          @close="showCombatModal = false"
          @update:character="handleUpdateCharacter"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { Book, Chapter } from '../types';
import { StorageFactory } from '../services/storage';
import CharacterSheet from '../components/CharacterSheet.vue';
import DiceRoller from '../components/DiceRoller.vue';
import CombatModal from '../components/CombatModal.vue';

const route = useRoute();
const router = useRouter();
const storage = StorageFactory.createStorage();

const book = ref<Book>({
  id: route.params.id as string,
  title: '',
  chapters: [],
  character: {
    name: '',
    hp: 0,
    gold: 0,
    inventory: []
  },
  genres: []
});

const currentChapter = ref<Chapter | null>(null);
const showCombatModal = ref(false);
const playerCharacter = ref({ ...book.value.character });

watch(
  () => book.value.character,
  (val) => {
    playerCharacter.value = { ...val };
  },
  { deep: true }
);

function handleUpdateCharacter(newChar) {
  playerCharacter.value = { ...newChar };
  book.value.character = { ...newChar };
  storage.saveBook(book.value);
}

onMounted(async () => {
  try {
    const savedBook = await storage.getBook(book.value.id);
    if (savedBook) {
      book.value = savedBook;
      const chapterId = route.params.chapterId as string;
      if (chapterId) {
        currentChapter.value = book.value.chapters.find(c => c.id === chapterId) || null;
      } else {
        // Si aucun chapitre n'est spécifié, on prend le premier
        currentChapter.value = book.value.chapters[0] || null;
      }
    } else {
      router.push('/books');
    }
  } catch (error) {
    console.error('Erreur lors du chargement du livre:', error);
    router.push('/books');
  }
});

const getChapterTitle = (id: string) => {
  const chapter = book.value.chapters.find(c => c.id === id);
  return chapter ? chapter.title : 'Chapitre inconnu';
};

const goToChapter = (chapterId: string) => {
  currentChapter.value = book.value.chapters.find(c => c.id === chapterId) || null;
};
</script>

<style scoped>
.book-reader {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.reader-container {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 2rem;
}

.chapter-content {
  background-color: var(--bg-secondary);
  padding: 2rem;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
}

h1 {
  font-family: 'Cinzel', serif;
  margin-bottom: 2rem;
  color: var(--text-primary);
}

.text {
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 2rem;
  white-space: pre-wrap;
}

.choices {
  display: grid;
  gap: 1rem;
  margin-top: 2rem;
}

.choice-button {
  background-color: var(--accent-primary);
  color: white;
  padding: 1rem;
  border: none;
  border-radius: var(--border-radius);
  cursor: pointer;
  text-align: left;
  transition: background-color 0.2s ease;
  border: 2px solid transparent;

}

.choice-button:hover {
  background-color:transparent;
  border: 2px solid var(--accent-primary);
}

.character-sheet-container {
  position: sticky;
  top: 2rem;
  align-self: start;
}

.combat-btn {
  margin-top: 1.5rem;
  background: var(--accent-warning);
  color: var(--text-primary);
  border: none;
  border-radius: var(--border-radius);
  padding: 0.7rem 1.5rem;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;
  box-shadow: var(--shadow);
  border: 2px solid transparent;
}

.combat-btn:hover {
  background-color: transparent;
  border: 2px solid var(--accent-warning);
  color: var(--accent-warning);
}
</style> 