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
        <CharacterSheet :character="book.character" />
        <DiceRoller />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { Book, Chapter } from '../types';
import { StorageFactory } from '../services/storage';
import CharacterSheet from '../components/CharacterSheet.vue';
import DiceRoller from '../components/DiceRoller.vue';

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
  }
});

const currentChapter = ref<Chapter | null>(null);

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
}

.choice-button:hover {
  background-color: var(--accent-secondary);
}

.character-sheet-container {
  position: sticky;
  top: 2rem;
  align-self: start;
}
</style> 