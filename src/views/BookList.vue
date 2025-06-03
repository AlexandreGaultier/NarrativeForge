<template>
  <div class="book-list">
    <h1>NarrativeForge</h1>
    <div class="book-list-controls">
      <input v-model="search" class="search-input" placeholder="Rechercher un livre..." />
      <select v-model="sortBy" class="sort-select">
        <option value="alpha">A → Z</option>
        <option value="date">Date de création</option>
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
        <h2>{{ book.title }}</h2>
        <div class="book-meta">
          <span v-if="book.genre" class="book-genre">{{ book.genre }}</span>
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
const sortBy = ref('alpha');
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
    list = list.filter(b => b.title.toLowerCase().includes(search.value.toLowerCase()));
  }
  if (genreFilter.value) {
    list = list.filter(b => b.genre === genreFilter.value);
  }
  if (sortBy.value === 'alpha') {
    list = [...list].sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortBy.value === 'date') {
    list = [...list].sort((a, b) => (a.id > b.id ? -1 : 1)); // id = timestamp
  }
  return list;
});

onMounted(async () => {
  try {
    const savedBooks = await storage.getAllBooks();
    books.value = savedBooks.length > 0 ? savedBooks : [];
  } catch (error) {
    books.value = [];
  }
});

const createNewBook = () => {
  const newId = `book-${Date.now()}`;
  const newBook: Book = {
    id: newId,
    title: "Nouveau Livre",
    chapters: [],
    character: {
      name: "Héros",
      hp: 100,
      gold: 0,
      inventory: []
    }
  };
  storage.saveBook(newBook).then(() => {
    router.push(`/books/${newId}/edit`);
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
</style> 