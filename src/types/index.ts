export interface Item {
  name: string;
  description: string;
}

export interface Character {
  name: string;
  hp: number;
  gold: number;
  inventory: string[];
  stats?: Record<string, number>; // Stats personnalisables (ATK, DEF, INT, etc.)
}

export interface Chapter {
  id: string;
  number?: number;
  title: string;
  text: string;
  next: string[];
}

export interface Book {
  id: string;
  title: string;
  genres: string[];
  chapters: Chapter[];
  character: Character;
} 