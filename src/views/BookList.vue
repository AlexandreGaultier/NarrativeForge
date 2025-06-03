<template>
  <div class="book-list">
    <h1>NarrativeForge</h1>
    <div class="book-list-controls">
      <input v-model="search" class="search-input" placeholder="Rechercher un livre..." />
      <select v-model="sortBy" class="sort-select">
        <option value="title">Trier par titre</option>
        <option value="date">Trier par date</option>
      </select>
      <select v-model="genreFilter" class="genre-select">
        <option value="">Tous les genres</option>
        <option v-for="g in genres" :key="g" :value="g">{{ g }}</option>
      </select>
    </div>
    <div class="books-grid">
      <div class="book-card create-card" @click="createNewBook">
        <div class="create-icon">+</div>
        <span>Créer un nouveau livre</span>
      </div>
      <div v-for="book in filteredBooks" :key="book.id" class="book-card">
        <div class="book-info">
          <h3>{{ book.title }}</h3>
          <div class="book-genres">
            <span v-for="genre in (book.genres || [])" 
                  :key="genre" 
                  class="genre-chip">
              {{ genre }}
            </span>
          </div>
        </div>
        <div class="book-actions">
          <button @click.stop="readBook(book.id)">Lire</button>
          <button @click.stop="editBook(book.id)">Éditer</button>
          <button @click.stop="confirmDelete(book.id)" class="delete-btn">Supprimer</button>
        </div>
      </div>
    </div>
    <dialog ref="confirmDialog">
      <p>Voulez-vous vraiment supprimer ce livre ?</p>
      <div class="dialog-actions">
        <button @click="deleteBook">Oui</button>
        <button @click="closeDialog">Non</button>
      </div>
    </dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import type { Book } from '../types';
import { StorageFactory } from '../services/storage';

const router = useRouter();
const books = ref<Book[]>([]);
const storage = StorageFactory.createStorage();

const search = ref('');
const sortBy = ref('title');
const genreFilter = ref('');
const confirmDialog = ref<HTMLDialogElement|null>(null);
const bookToDelete = ref<string|null>(null);

const genres = computed(() => {
  const set = new Set(books.value.map(b => b.genre).filter(Boolean));
  return Array.from(set) as string[];
});

const filteredBooks = computed(() => {
  let list = books.value;
  
  if (search.value) {
    list = list.filter(b => 
      b.title.toLowerCase().includes(search.value.toLowerCase())
    );
  }
  
  if (genreFilter.value) {
    list = list.filter(b => b.genres && b.genres.includes(genreFilter.value));
  }
  
  if (sortBy.value === 'title') {
    list = [...list].sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortBy.value === 'date') {
    list = [...list].sort((a, b) => parseInt(b.id) - parseInt(a.id));
  }
  
  return list;
});

onMounted(async () => {
  books.value = await storage.getAllBooks();
  
  // Collecter tous les genres uniques
  const genres = new Set<string>();
  books.value.forEach(book => {
    if (Array.isArray(book.genres)) {
      book.genres.forEach(g => genres.add(g));
    }
  });
  genreFilter.value = Array.from(genres)[0] || '';
});

const createNewBook = () => {
  const newBook: Book = {
    id: `book-${Date.now()}`,
    title: 'Nouveau Livre',
    genres: [],
    chapters: [],
    character: {
      name: 'Héros',
      hp: 100,
      gold: 50,
      inventory: []
    }
  };
  
  storage.saveBook(newBook).then(() => {
    router.push(`/books/${newBook.id}`);
  });
};

const readBook = (id: string) => {
  router.push(`/books/${id}/read`);
};

const editBook = (id: string) => {
  router.push(`/books/${id}/edit`);
};

function confirmDelete(id: string) {
  bookToDelete.value = id;
  confirmDialog.value?.showModal();
}
function closeDialog() {
  confirmDialog.value?.close();
  bookToDelete.value = null;
}
async function deleteBook() {
  if (bookToDelete.value) {
    await storage.deleteBook(bookToDelete.value);
    books.value = books.value.filter(b => b.id !== bookToDelete.value);
    closeDialog();
  }
}
</script>

<style scoped>
.book-list {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}
.book-list-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
  margin-bottom: 2rem;
}
.search-input, .sort-select, .genre-select {
  padding: 0.5rem 1rem;
  border-radius: var(--border-radius);
  border: 1px solid var(--text-secondary);
  background: var(--card-bg);
  color: var(--text-primary);
  font-size: 1rem;
}
.books-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}
.book-card {
  background-color: var(--bg-secondary);
  padding: 1.5rem;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  transition: transform 0.2s ease;
}
.book-card:hover {
  transform: translateY(-5px);
}
.book-meta {
  margin-bottom: 0.5rem;
}
.book-genre {
  display: inline-block;
  background: var(--accent-warning);
  color: var(--text-primary);
  border-radius: 16px;
  padding: 0.3rem 0.8rem;
  font-size: 0.9rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
}
.book-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}
.book-actions button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: var(--border-radius);
  cursor: pointer;
}
.book-actions button:first-child {
  background-color: var(--accent-primary);
  color: white;
}
.book-actions button:nth-child(2) {
  background-color: var(--accent-warning);
  color: var(--text-primary);
}
.delete-btn {
  background: #f44336;
  color: white;
}
.dialog-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1rem;
}
.create-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  min-height: 200px;
  border: 2px dashed var(--text-secondary);
  background: transparent;
}
.create-icon {
  font-size: 3rem;
  color: var(--text-secondary);
  margin-bottom: 1rem;
}
.create-card span {
  color: var(--text-secondary);
  font-size: 1.1rem;
}
.book-genres {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.genre-chip {
  background: var(--accent-primary);
  color: white;
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
  font-size: 0.8rem;
}
</style> 