import type { Book } from '../types';
import sampleBooks from '../data/sample-books.json';

export interface StorageService {
  getAllBooks(): Promise<Book[]>;
  getBook(id: string): Promise<Book | null>;
  saveBook(book: Book): Promise<void>;
  deleteBook(id: string): Promise<void>;
}

export class LocalStorageService implements StorageService {
  private readonly STORAGE_KEY = 'narrative-forge-books';

  async getAllBooks(): Promise<Book[]> {
    const booksJson = localStorage.getItem(this.STORAGE_KEY);
    if (!booksJson) {
      const initialBooks = sampleBooks.books.map(book => ({
        ...book,
        genres: book.genre ? [book.genre] : []
      })) as Book[];
      await this.saveBooks(initialBooks);
      return initialBooks;
    }

    const books = JSON.parse(booksJson) as Book[];
    // Migration des anciens livres
    return books.map(book => {
      if ('genre' in book && !('genres' in book)) {
        const { genre, ...rest } = book as any;
        return {
          ...rest,
          genres: genre ? [genre] : []
        } as Book;
      }
      return book;
    });
  }

  async getBook(id: string): Promise<Book | null> {
    const books = await this.getAllBooks();
    return books.find(book => book.id === id) || null;
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
    const filteredBooks = books.filter(book => book.id !== id);
    await this.saveBooks(filteredBooks);
  }

  async saveBooks(books: Book[]): Promise<void> {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(books));
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
  static createStorage(): StorageService {
    return new LocalStorageService();
  }
} 