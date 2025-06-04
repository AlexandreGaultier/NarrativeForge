<template>
  <div class="book-editor">
    

    <div class="editor-container">
      <!-- Formulaire d'édition à gauche -->
      <div class="chapter-editor" v-if="currentChapter">
        <div class="editor-header">
          <input v-model="currentChapter.title" 
                 placeholder="Titre du chapitre" 
                 class="chapter-title">
          <button @click="deleteChapter" class="delete-chapter">Supprimer le chapitre</button>
        </div>
        <div class="chapter-fields">
          <label class="chapter-label">Numéro</label>
          <input v-model.number="currentChapter.number" type="number" min="1" class="chapter-number" />
        </div>
        <textarea v-model="currentChapter.text" 
                  placeholder="Contenu du chapitre" 
                  class="chapter-content"></textarea>
        <div class="next-chapters">
          <h3>Chapitres suivants</h3>
          <div class="next-chapters-list">
            <div v-for="(nextId, index) in currentChapter.next" :key="nextId" class="next-chapter">
              <select :value="nextId" 
                      @change="(e: Event) => updateNextChapter(index, (e.target as HTMLSelectElement).value)" 
                      class="chapter-select">
                <option v-for="chapter in availableChapters" 
                        :key="chapter.id" 
                        :value="chapter.id">
                  {{ chapter.number ? chapter.number + ': ' : '' }}{{ chapter.title || 'Sans titre' }}
                </option>
              </select>
              <button @click="removeNextChapter(index)" class="remove-next">×</button>
            </div>
          </div>
          <button @click="addNextChapter" class="add-next">Ajouter un chapitre suivant</button>
        </div>
        <div class="editor-actions">
          <button @click="saveBook" class="save-button">Sauvegarder</button>
        </div>
      </div>
      <!-- Colonne de droite : métadonnées + liste des chapitres -->
      <div class="right-panel">
        <div class="book-metadata">
          <div class="metadata-card">
            <h2 class="book-title" 
                contenteditable="true"
                @blur="updateTitle"
                @keyup.enter="updateTitle"
                ref="titleInput">{{ book.title }}</h2>
            <div class="form-group">
              <div class="genre-input">
                <input 
                  v-model="newGenre"
                  type="text"
                  placeholder="Ajouter un genre"
                  @keyup.enter="addGenre"
                />
                <button @click="addGenre" class="add-genre-btn">+</button>
              </div>
              <div class="genres-list">
                <div 
                  v-for="genre in availableGenres" 
                  :key="genre"
                  class="genre-chip"
                  :class="{ 'selected': book.genres.includes(genre) }"
                  @click="selectGenre(genre)"
                >
                  {{ genre }}
                  <button 
                    v-if="!book.genres.includes(genre)"
                    @click.stop="removeGenre(genre)"
                    class="remove-genre"
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="chapters-list-graph">
          <div class="chapters-list">
            <h2>Chapitres</h2>
            <button @click="createNewChapter" class="new-chapter">Nouveau Chapitre</button>
            <ul>
              <li v-for="chapter in sortedChapters" 
                  :key="chapter.id"
                  :class="{ active: currentChapter?.id === chapter.id }"
                  @click="selectChapter(chapter)">
                <span class="chapter-title">{{ chapter.number ? chapter.number + ': ' : '' }}{{ chapter.title || 'Sans titre' }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    <ChapterGraph :chapters="book.chapters" @select="onGraphSelect" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { Book, Chapter } from '../types';
import { StorageFactory } from '../services/storage';
import ChapterGraph from '../components/ChapterGraph.vue';

const route = useRoute();
const router = useRouter();
const storage = StorageFactory.createStorage();

const book = ref<Book>({
  id: route.params.id as string,
  title: 'Nouveau Livre',
  genres: [],
  chapters: [],
  character: {
    name: 'Héros',
    hp: 100,
    gold: 50,
    inventory: []
  }
});

const newGenre = ref('');
const availableGenres = ref<string[]>([]);
const currentChapter = ref<Chapter | null>(null);
const titleInput = ref<HTMLElement | null>(null);

// Liste triée par numéro croissant puis titre
const sortedChapters = computed(() => {
  return [...book.value.chapters].sort((a, b) => {
    if (a.number !== undefined && b.number !== undefined) {
      return a.number - b.number;
    }
    return a.title.localeCompare(b.title);
  });
});

// Liste des chapitres disponibles pour les liens (hors chapitre courant)
const availableChapters = computed(() => {
  return book.value.chapters.filter(chapter => chapter.id !== currentChapter.value?.id);
});

onMounted(async () => {
  try {
    const savedBook = await storage.getBook(book.value.id);
    if (savedBook) {
      // Migration éventuelle des anciens chapitres sans numéro
      savedBook.chapters.forEach((ch, idx) => {
        if (ch.number === undefined) ch.number = idx + 1;
      });
      // Migration des anciens livres avec un seul genre
      if ('genre' in savedBook) {
        const genreValue = (savedBook as any)['genre'];
        savedBook.genres = genreValue ? [String(genreValue)] : [];
        delete (savedBook as any)['genre'];
      }
      book.value = savedBook;
      if (book.value.chapters.length > 0) {
        currentChapter.value = book.value.chapters[0];
      }
    } else {
      router.push('/books');
    }

    // Charger tous les genres existants
    const allBooks = await storage.getAllBooks();
    const genres = new Set<string>();
    allBooks.forEach(b => {
      if (Array.isArray(b.genres)) {
        b.genres.forEach(g => genres.add(g));
      } else if ('genre' in b && b['genre']) {
        genres.add(String(b['genre']));
      }
    });
    availableGenres.value = Array.from(genres);
  } catch (error) {
    console.error('Erreur lors du chargement du livre:', error);
    router.push('/books');
  }
});

const createNewChapter = () => {
  // Numéro auto-incrémenté (max+1)
  const maxNumber = book.value.chapters
    .filter(ch => typeof ch.number === 'number')
    .reduce((max, ch) => (ch.number! > max ? ch.number! : max), 0);
  const newChapter: Chapter = {
    id: `chapter-${Date.now()}`,
    number: maxNumber + 1,
    title: 'Nouveau Chapitre',
    text: '',
    next: []
  };
  book.value.chapters.push(newChapter);
  currentChapter.value = newChapter;
  saveBook();
};

const selectChapter = (chapter: Chapter) => {
  currentChapter.value = chapter;
};

const deleteChapter = () => {
  if (currentChapter.value) {
    const index = book.value.chapters.findIndex(c => c.id === currentChapter.value?.id);
    if (index >= 0) {
      book.value.chapters.splice(index, 1);
      // Supprimer les références à ce chapitre dans les autres chapitres
      book.value.chapters.forEach(chapter => {
        chapter.next = chapter.next.filter(id => id !== currentChapter.value?.id);
      });
      currentChapter.value = book.value.chapters[0] || null;
      saveBook();
    }
  }
};

const addNextChapter = () => {
  if (currentChapter.value && availableChapters.value.length > 0) {
    const firstAvailableChapter = availableChapters.value[0];
    currentChapter.value.next.push(firstAvailableChapter.id);
    saveBook();
  }
};

const updateNextChapter = (index: number, newId: string) => {
  if (currentChapter.value) {
    currentChapter.value.next[index] = newId;
    saveBook();
  }
};

const removeNextChapter = (index: number) => {
  if (currentChapter.value) {
    currentChapter.value.next.splice(index, 1);
    saveBook();
  }
};

const saveBook = async () => {
  try {
    await storage.saveBook(book.value);
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du livre:', error);
  }
};

const onGraphSelect = (id: string) => {
  const chapter = book.value.chapters.find(c => c.id === id);
  if (chapter) selectChapter(chapter);
};

const updateTitle = () => {
  if (titleInput.value) {
    book.value.title = titleInput.value.textContent || '';
    saveBook();
  }
};

const addGenre = () => {
  if (newGenre.value.trim() && !availableGenres.value.includes(newGenre.value.trim())) {
    const genre = newGenre.value.trim();
    availableGenres.value.push(genre);
    book.value.genres.push(genre);
    newGenre.value = '';
    saveBook();
  }
};

const selectGenre = (genre: string) => {
  if (!book.value.genres.includes(genre)) {
    book.value.genres.push(genre);
  } else {
    book.value.genres = book.value.genres.filter(g => g !== genre);
  }
  saveBook();
};

const removeGenre = (genre: string) => {
  book.value.genres = book.value.genres.filter(g => g !== genre);
  availableGenres.value = availableGenres.value.filter(g => g !== genre);
  saveBook();
};
</script>

<style scoped>
.book-editor {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem 0;
}

.book-metadata {
  margin-bottom: 2rem;
}

.right-panel {
  display: flex;
  flex-direction: column;
  flex: 2 1 0;
  min-width: 260px;
  max-width: 400px;
}

.metadata-card {
  background: var(--bg-secondary);
  padding: 1.5rem;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
}

.metadata-card h2 {
  margin-bottom: 1.5rem;
  color: var(--text-primary);
  font-size: 1.2rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-group label {
  font-weight: 500;
  color: var(--text-primary);
}

.form-group input {
  padding: 0.5rem;
  border: 1px solid var(--text-secondary);
  border-radius: var(--border-radius);
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.genre-input {
  display: flex;
  gap: 0.5rem;
}

.add-genre-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: var(--border-radius);
  background: var(--accent-primary);
  color: white;
  cursor: pointer;
}

.genres-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
}

.genre-chip {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.3rem 0.8rem;
  background: var(--bg-secondary);
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.genre-chip.selected {
  background: var(--accent-primary);
  color: white;
}

.remove-genre {
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 0 0.2rem;
}

.genre-chip:hover {
  transform: translateY(-2px);
}

.editor-container {
  display: flex;
  flex-direction: row;
  gap: 2rem;
}

.chapter-editor {
  flex: 3 1 0;
  background-color: var(--bg-secondary);
  padding: 2rem;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.editor-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.chapter-title {
  font-size: 1.2rem;
  padding: 0.5rem;
  border: none;
  border-bottom: 2px solid var(--accent-primary);
  background: transparent;
  color: var(--text-primary);
  width: 100%;
}

.chapter-fields {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.chapter-label {
  color: var(--text-secondary);
  font-weight: 500;
}

.chapter-number {
  width: 80px;
  padding: 0.5rem;
  border-radius: var(--border-radius);
  border: 1px solid var(--text-secondary);
  background: var(--card-bg);
  color: var(--text-primary);
}

.chapter-content {
  width: 100%;
  height: 200px;
  padding: 0.5rem;
  resize: vertical;
  background-color: var(--card-bg);
  color: var(--text-primary);
  border: 1px solid var(--text-secondary);
  border-radius: var(--border-radius);
}

.next-chapters {
  margin-top: 1rem;
}

.next-chapter {
  display: flex;
  gap: 0.5rem;
  margin: 0.5rem 0;
}

.chapter-select {
  flex: 1;
  padding: 0.5rem;
  background-color: var(--card-bg);
  color: var(--text-primary);
  border: 1px solid var(--text-secondary);
  border-radius: var(--border-radius);
}

.remove-next {
  padding: 0.5rem;
  background-color: var(--accent-warning);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  cursor: pointer;
}

button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: var(--border-radius);
  cursor: pointer;
  background-color: var(--accent-primary);
  color: white;
  transition: all 0.2s ease;
  border: 2px solid transparent;
}
button:hover {
  background-color: transparent;
  border: 2px solid var(--accent-primary);
}

button.add-next {
  margin-top: 1rem;
  background-color: var(--accent-primary);
}

button.new-chapter {
  width: 100%;
  margin-bottom: 1rem;
}

button.delete-chapter {
  background-color: var(--accent-warning);
  border: 2px solid transparent;
  transition: all 0.2s ease;
}
button.delete-chapter:hover {
  background-color: transparent;
  border: 2px solid var(--accent-warning);
}

.editor-actions {
  margin-top: 2rem;
  display: flex;
  justify-content: flex-end;
}

.save-button {
  background-color: var(--accent-primary);
  padding: 0.75rem 1.5rem;
  font-size: 1.1rem;
  border: 2px solid transparent;
}
.save-button:hover {
  background-color: transparent;
  border: 2px solid var(--accent-primary);
}

.chapters-list {
  flex: 2 1 0;
  background-color: var(--bg-secondary);
  padding: 2rem 1rem;
  border-radius: var(--border-radius);
  min-width: 260px;
  box-shadow: var(--shadow);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.chapters-list h2 {
  font-family: 'Cinzel', serif;
  font-size: 1.3rem;
  color: var(--text-primary);
  margin-top: 0;
  margin-bottom: 1rem;
}

.chapters-list ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.chapters-list li {
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  border-radius: var(--border-radius);
  transition: background-color 0.2s, color 0.2s;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid transparent;
}

.chapters-list li:hover {
  background-color: var(--accent-primary);
  color: white;
}

.chapters-list li.active {
  background-color: var(--accent-primary);
  color: white;
  border: 1px solid var(--accent-primary);
}

.chapter-id {
  font-size: 0.8rem;
  opacity: 0.7;
  margin-left: 1rem;
}

.chapters-list-graph {
  flex: 2 1 0;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  min-width: 260px;
  max-width: 400px;
}

.book-title {
  font-size: 2rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-top: 0;
  margin-bottom: 1.5rem;
  padding: 0.5rem;
  border: 2px solid transparent;
  border-radius: var(--border-radius);
  transition: all 0.2s ease;
}

.book-title:hover {
  border-color: var(--accent-primary);
}

.book-title:focus {
  outline: none;
  border-color: var(--accent-primary);
  background: var(--bg-primary);
}

@media (max-width: 900px) {
  .editor-container {
    flex-direction: column;
  }
  .chapters-list-graph {
    max-width: 100%;
    width: 100%;
    margin-top: 2rem;
  }
}
</style> 