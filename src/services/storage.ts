import type { Book } from '../types';

export interface StorageService {
  getAllBooks(): Promise<Book[]>;
  getBook(id: string): Promise<Book | null>;
  saveBook(book: Book): Promise<void>;
  deleteBook(id: string): Promise<void>;
}

export class LocalStorageService implements StorageService {
  private readonly BOOKS_KEY = 'narrative_forge_books';

  async getAllBooks(): Promise<Book[]> {
    const booksJson = localStorage.getItem(this.BOOKS_KEY);
    return booksJson ? JSON.parse(booksJson) : [];
  }

  async getBook(id: string): Promise<Book | null> {
    const books = await this.getAllBooks();
    return books.find(book => book.id === id) || null;
  }

  async saveBook(book: Book): Promise<void> {
    const books = await this.getAllBooks();
    const index = books.findIndex(b => b.id === book.id);
    
    if (index >= 0) {
      books[index] = book;
    } else {
      books.push(book);
    }
    
    localStorage.setItem(this.BOOKS_KEY, JSON.stringify(books));
  }

  async deleteBook(id: string): Promise<void> {
    const books = await this.getAllBooks();
    const filteredBooks = books.filter(book => book.id !== id);
    localStorage.setItem(this.BOOKS_KEY, JSON.stringify(filteredBooks));
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