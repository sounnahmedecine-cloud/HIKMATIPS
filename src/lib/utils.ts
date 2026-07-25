import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getBasePath(): string {
  const envBase = process.env.NEXT_PUBLIC_BASE_PATH || '';
  if (envBase) return envBase;
  if (typeof window !== 'undefined' && window.location.pathname.startsWith('/HIKMATIPS')) {
    return '/HIKMATIPS';
  }
  return '';
}

export type Hikma = {
  arabe: string;
  fr: string;
  source: string;
  id?: string;
}

export function getFavorites(): Hikma[] {
  if (typeof window === 'undefined') return [];
  const saved = localStorage.getItem('hikma_favorites');
  return saved ? JSON.parse(saved) : [];
}

export function toggleFavorite(hikma: Hikma) {
  const favorites = getFavorites();
  const exists = favorites.find(f => f.fr === hikma.fr);
  let newFavorites;
  if (exists) {
    newFavorites = favorites.filter(f => f.fr !== hikma.fr);
  } else {
    newFavorites = [...favorites, hikma];
  }
  localStorage.setItem('hikma_favorites', JSON.stringify(newFavorites));
  return !exists;
}

// --- Streak & Stats System ---
export interface UserStats {
  streak: number;
  lastVisit: string;
  totalVisits: number;
  favoritesCount: number;
}

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

export function updateStreak(): UserStats {
  if (typeof window === 'undefined') return { streak: 0, lastVisit: '', totalVisits: 0, favoritesCount: 0 };
  try {
    const raw = localStorage.getItem('hikma_user_stats');
    const stats: UserStats = raw ? JSON.parse(raw) : { streak: 0, lastVisit: '', totalVisits: 0, favoritesCount: 0 };
    const today = getToday();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    if (stats.lastVisit === today) return stats;
    if (stats.lastVisit === yesterdayStr) stats.streak += 1;
    else if (stats.lastVisit === '') stats.streak = 1;
    else stats.streak = 1;
    stats.lastVisit = today;
    stats.totalVisits += 1;
    stats.favoritesCount = getFavorites().length;
    localStorage.setItem('hikma_user_stats', JSON.stringify(stats));
    return stats;
  } catch {
    return { streak: 0, lastVisit: '', totalVisits: 0, favoritesCount: 0 };
  }
}

export function getUserStats(): UserStats {
  if (typeof window === 'undefined') return { streak: 0, lastVisit: '', totalVisits: 0, favoritesCount: 0 };
  try {
    const raw = localStorage.getItem('hikma_user_stats');
    return raw ? JSON.parse(raw) : { streak: 0, lastVisit: '', totalVisits: 0, favoritesCount: 0 };
  } catch {
    return { streak: 0, lastVisit: '', totalVisits: 0, favoritesCount: 0 };
  }
}

// --- Collections System ---
export interface Collection {
  id: string;
  name: string;
  emoji: string;
  createdAt: string;
  items: Hikma[];
}

export function getCollections(): Collection[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('hikma_collections');
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function saveCollections(collections: Collection[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('hikma_collections', JSON.stringify(collections));
  } catch {}
}

export function createCollection(name: string, emoji: string = '📚'): Collection {
  const collection: Collection = {
    id: Date.now().toString(),
    name,
    emoji,
    createdAt: new Date().toISOString(),
    items: [],
  };
  const collections = getCollections();
  collections.push(collection);
  saveCollections(collections);
  return collection;
}

export function addToCollection(collectionId: string, hikma: Hikma): boolean {
  const collections = getCollections();
  const col = collections.find(c => c.id === collectionId);
  if (!col) return false;
  if (col.items.find(i => i.fr === hikma.fr)) return false;
  col.items.push(hikma);
  saveCollections(collections);
  return true;
}

export function removeFromCollection(collectionId: string, hikmaFr: string) {
  const collections = getCollections();
  const col = collections.find(c => c.id === collectionId);
  if (!col) return;
  col.items = col.items.filter(i => i.fr !== hikmaFr);
  saveCollections(collections);
}

export function deleteCollection(collectionId: string) {
  const collections = getCollections().filter(c => c.id !== collectionId);
  saveCollections(collections);
}
