import { Injectable, inject, PLATFORM_ID, signal, computed } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type Theme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private platformId = inject(PLATFORM_ID);

  private theme = signal<Theme>('light');

  isDarkMode = computed(() => this.theme() === 'dark');

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadTheme();
    }
  }

  private loadTheme(): void {
    if (typeof localStorage === 'undefined' || typeof document === 'undefined') {
      return;
    }

    const savedTheme = localStorage.getItem('theme') as Theme | null;

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    const initialTheme: Theme = savedTheme || (prefersDark ? 'dark' : 'light');

    this.setTheme(initialTheme, false);
  }

  toggleTheme(): void {
    const newTheme: Theme = this.theme() === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme, true);
  }

  setTheme(theme: Theme, save: boolean = true): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.theme.set(theme);

    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    if (save) {
      localStorage.setItem('theme', theme);
    }
  }

  getTheme(): Theme {
    return this.theme();
  }

  watchSystemPreference(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent) => {
      const savedTheme = localStorage.getItem('theme');
      if (!savedTheme) {
        this.setTheme(e.matches ? 'dark' : 'light', false);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
  }
}
