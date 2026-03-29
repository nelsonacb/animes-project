import { Injectable, inject, PLATFORM_ID, signal, computed } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { StorageService } from './storage.service';
import { Anime } from '../interfaces';

@Injectable({ providedIn: 'root' })
export class FavoritesService {
  private platformId = inject(PLATFORM_ID);
  private storage = inject(StorageService);

  private favorites = signal<Anime[]>([]);

  favoritesCount = computed(() => this.favorites().length);

  private favoritesIds = computed(() => {
    const ids = new Set<number>();
    this.favorites().forEach((anime) => ids.add(anime.mal_id));
    return ids;
  });

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadFavorites();
    }
  }

  private loadFavorites(): void {
    const saved = this.storage.getItem('favorites');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        this.favorites.set(Array.isArray(parsed) ? parsed : []);
      } catch {
        this.favorites.set([]);
      }
    }
  }

  isFavorite(animeId: number): boolean {
    return this.favoritesIds().has(animeId);
  }

  toggleFavorite(anime: Anime): { added: boolean; count: number } {
    const current = this.favorites();
    const index = current.findIndex((a) => a.mal_id === anime.mal_id);

    let added: boolean;
    let updated: Anime[];

    if (index === -1) {
      updated = [...current, anime];
      added = true;
    } else {
      updated = [...current.slice(0, index), ...current.slice(index + 1)];
      added = false;
    }

    this.favorites.set(updated);

    this.storage.setItem('favorites', JSON.stringify(updated));

    return { added, count: updated.length };
  }

  addFavorite(anime: Anime): void {
    if (!this.isFavorite(anime.mal_id)) {
      this.toggleFavorite(anime);
    }
  }

  removeFavorite(animeId: number): void {
    if (this.isFavorite(animeId)) {
      const current = this.favorites();
      const updated = current.filter((a) => a.mal_id !== animeId);
      this.favorites.set(updated);
      this.storage.setItem('favorites', JSON.stringify(updated));
    }
  }

  getFavorites(): Anime[] {
    return this.favorites();
  }

  clearFavorites(): void {
    this.favorites.set([]);
    this.storage.removeItem('favorites');
  }
}
