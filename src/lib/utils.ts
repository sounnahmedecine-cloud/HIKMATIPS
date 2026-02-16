import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
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
