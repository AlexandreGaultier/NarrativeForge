<template>
  <div class="book-list">
    <h1>NarrativeForge</h1>
    <button class="create-book" @click="createNewBook">Créer un nouveau livre</button>
    
    <div class="books-grid">
      <div v-for="book in books" :key="book.id" class="book-card">
        <h2>{{ book.title }}</h2>
        <div class="book-actions">
          <button @click="readBook(book.id)">Lire</button>
          <button @click="editBook(book.id)">Éditer</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import type { Book } from '../types';
import { StorageFactory } from '../services/storage';

const router = useRouter();
const books = ref<Book[]>([]);
const storage = StorageFactory.createStorage();

// Données mockées pour le développement
const mockBooks: Book[] = [
  {
    id: 'book-1',
    title: 'L\'Aventure du Dragon',
    chapters: [],
    character: {
      name: 'Héros',
      hp: 100,
      gold: 50,
      inventory: []
    }
  },
  {
    id: 'book-2',
    title: 'Le Mystère de la Tour',
    chapters: [],
    character: {
      name: 'Aventurier',
      hp: 80,
      gold: 100,
      inventory: []
    }
  }
];

onMounted(async () => {
  try {
    const savedBooks = await storage.getAllBooks();
    if (savedBooks.length === 0) {
      // Si aucun livre n'existe, on sauvegarde les livres mockés
      console.log('Initialisation avec les livres mockés');
      for (const book of mockBooks) {
        await storage.saveBook(book);
      }
      books.value = mockBooks;
    } else {
      books.value = savedBooks;
    }
  } catch (error) {
    console.error('Erreur lors du chargement des livres:', error);
    books.value = mockBooks;
  }
});

const createNewBook = () => {
  const newId = `book-${Date.now()}`;
  router.push(`/books/${newId}/edit`);
};

const readBook = (id: string) => {
  console.log('Attempting to read book:', id);
  router.push(`/books/${id}/read`);
};

const editBook = (id: string) => {
  console.log('Attempting to edit book:', id);
  router.push(`/books/${id}/edit`);
};
</script>

<style scoped>
.book-list {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.create-book {
  background-color: var(--accent-secondary);
  color: white;
  padding: 1rem 2rem;
  border: none;
  border-radius: var(--border-radius);
  cursor: pointer;
  margin-bottom: 2rem;
}

.books-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
}

.book-card {
  background-color: var(--bg-secondary);
  padding: 1.5rem;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
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

.book-actions button:last-child {
  background-color: var(--accent-warning);
  color: var(--text-primary);
}
</style> 