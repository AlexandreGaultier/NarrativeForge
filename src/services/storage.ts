import type { Book } from '../types';
import sampleBooks from '../data/sample-books.json';

export interface StorageService {
  getAllBooks(): Promise<Book[]>;
  getBook(id: string): Promise<Book | null>;
  saveBook(book: Book): Promise<void>;
  deleteBook(id: string): Promise<void>;
}

export class LocalStorageService implements StorageService {
  private readonly BOOKS_KEY = 'narrative_forge_books';

  async getAllBooks(): Promise<Book[]> {
    const books = localStorage.getItem(this.BOOKS_KEY);
    if (!books) {
      // Si aucun livre n'est stocké, on initialise avec les livres d'exemple
      const initialBooks = sampleBooks.books as Book[];
      await this.saveBooks(initialBooks);
      return initialBooks;
    }
    return JSON.parse(books);
  }

  async getBook(id: string): Promise<Book | null> {
    const books = await this.getAllBooks();
    return books.find(book => book.id === id) || null;
  }

  async saveBooks(books: Book[]): Promise<void> {
    localStorage.setItem(this.BOOKS_KEY, JSON.stringify(books));
  }

  async saveBook(book: Book): Promise<void> {
    const books = await this.getAllBooks();
    const index = books.findIndex(b => b.id === book.id);
    if (index === -1) {
      books.push(book);
    } else {
      books[index] = book;
    }
    await this.saveBooks(books);
  }

  async deleteBook(id: string): Promise<void> {
    const books = await this.getAllBooks();
    const filteredBooks = books.filter(b => b.id !== id);
    await this.saveBooks(filteredBooks);
  }
}

// Exemple de service IndexDB (à implémenter plus tard)
export class IndexDBService implements StorageService {
  async getAllBooks(): Promise<Book[]> {
    // À implémenter
    return [];
  }

  async getBook(id: string): Promise<Book | null> {
    // À implémenter
    return null;
  }

  async saveBook(book: Book): Promise<void> {
    // À implémenter
  }

  async deleteBook(id: string): Promise<void> {
    // À implémenter
  }
}

// Exemple de service Firestore (à implémenter plus tard)
export class FirestoreService implements StorageService {
  async getAllBooks(): Promise<Book[]> {
    // À implémenter
    return [];
  }

  async getBook(id: string): Promise<Book | null> {
    // À implémenter
    return null;
  }

  async saveBook(book: Book): Promise<void> {
    // À implémenter
  }

  async deleteBook(id: string): Promise<void> {
    // À implémenter
  }
}

// Factory pour créer le service de stockage approprié
export class StorageFactory {
  static createStorage(type: 'localStorage' | 'indexDB' | 'firestore' = 'localStorage'): StorageService {
    switch (type) {
      case 'indexDB':
        return new IndexDBService();
      case 'firestore':
        return new FirestoreService();
      default:
        return new LocalStorageService();
    }
  }
} 