import { Injectable, inject, PLATFORM_ID, signal, computed } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

// Tipo para los temas disponibles
export type Theme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  // ═════════════════════════════════════════════════════════════
  // 1. INYECCIÓN DE DEPENDENCIAS
  // ═════════════════════════════════════════════════════════════
  private platformId = inject(PLATFORM_ID);

  // ═════════════════════════════════════════════════════════════
  // 2. SIGNALS PARA ESTADO REACTIVO
  // ═════════════════════════════════════════════════════════════
  // Signal privado para el estado interno del tema
  private theme = signal<Theme>('light');

  // Signal computado: retorna TRUE si es dark mode
  // Cualquier componente que se suscriba se actualiza automáticamente
  isDarkMode = computed(() => this.theme() === 'dark');

  // ═════════════════════════════════════════════════════════════
  // 3. INICIALIZACIÓN (SOLO EN NAVEGADOR)
  // ═════════════════════════════════════════════════════════════
  constructor() {
    // Solo inicializar en el navegador, NO en servidor (SSR-safe)
    if (isPlatformBrowser(this.platformId)) {
      this.loadTheme();
    }
  }

  // ═════════════════════════════════════════════════════════════
  // 4. MÉTODO: CARGAR TEMA GUARDADO
  // ═════════════════════════════════════════════════════════════
  private loadTheme(): void {
    // Verificación de seguridad extra
    if (typeof localStorage === 'undefined' || typeof document === 'undefined') {
      return;
    }

    // 1. Intentar leer tema guardado en localStorage
    const savedTheme = localStorage.getItem('theme') as Theme | null;

    // 2. Si no hay tema guardado, verificar preferencia del sistema
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    // 3. Determinar tema inicial
    const initialTheme: Theme = savedTheme || (prefersDark ? 'dark' : 'light');

    // 4. Aplicar tema
    this.setTheme(initialTheme, false); // false = no guardar (ya viene guardado)
  }

  // ═════════════════════════════════════════════════════════════
  // 5. MÉTODO: CAMBIAR TEMA (PÚBLICO)
  // ═════════════════════════════════════════════════════════════
  toggleTheme(): void {
    const newTheme: Theme = this.theme() === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme, true);
  }

  // ═════════════════════════════════════════════════════════════
  // 6. MÉTODO: ESTABLECER TEMA ESPECÍFICO (PÚBLICO)
  // ═════════════════════════════════════════════════════════════
  setTheme(theme: Theme, save: boolean = true): void {
    // Solo ejecutar en navegador
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // 1. Actualizar signal interno
    this.theme.set(theme);

    // 2. Aplicar clase 'dark' al elemento <html>
    //    Tailwind usa class strategy para dark mode
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // 3. Guardar en localStorage (opcional)
    if (save) {
      localStorage.setItem('theme', theme);
    }
  }

  // ═════════════════════════════════════════════════════════════
  // 7. MÉTODO: OBTENER TEMA ACTUAL (PÚBLICO)
  // ═════════════════════════════════════════════════════════════
  getTheme(): Theme {
    return this.theme();
  }

  // ═════════════════════════════════════════════════════════════
  // 8. MÉTODO: ESCUCHAR CAMBIOS DE PREFERENCIA DEL SISTEMA
  // ═════════════════════════════════════════════════════════════
  watchSystemPreference(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // Crear MediaQueryList para escuchar cambios del sistema
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    // Callback cuando el usuario cambia preferencia del sistema
    const handleChange = (e: MediaQueryListEvent) => {
      // Solo cambiar si el usuario NO ha establecido preferencia manual
      const savedTheme = localStorage.getItem('theme');
      if (!savedTheme) {
        this.setTheme(e.matches ? 'dark' : 'light', false);
      }
    };

    // Suscribirse a cambios (API moderna)
    mediaQuery.addEventListener('change', handleChange);
  }
}
