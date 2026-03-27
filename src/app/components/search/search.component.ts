import { Component, inject, OnInit, signal, computed, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { AnimeCardComponent } from '../shared/anime-card/anime-card.component';
import { AnimeService } from '../../services/anime.service';
import { ThemeService } from '../../services/theme.service';
import { UiErrorComponent } from '../shared/ui-error/ui-error.component';
import { Anime } from '../../interfaces';
import { UiPaginationComponent } from '../shared/ui-pagination/ui-pagination.component';
import { UiLoadingComponent } from '../shared/ui-loading/ui-loading.component';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule, // ← Para FormControl
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatProgressBarModule,
    MatChipsModule,
    AnimeCardComponent,
    UiErrorComponent,
    UiPaginationComponent,
    UiLoadingComponent,
  ],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css'],
})
export class SearchComponent implements OnInit, OnDestroy {
  [x: string]: any;
  private animeService = inject(AnimeService);
  private route = inject(ActivatedRoute);
  private themeService = inject(ThemeService);

  // ═════════════════════════════════════════════════════════════
  // SIGNALS PARA ESTADO
  // ═════════════════════════════════════════════════════════════
  searchResults = signal<Anime[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  currentPage = signal(1);
  hasNextPage = signal(false);
  totalResults = signal(0);

  // Query actual (para mostrar en UI)
  currentQuery = signal('');

  // ═════════════════════════════════════════════════════════════
  // FORM CONTROL PARA EL INPUT DE BÚSQUEDA
  // ═════════════════════════════════════════════════════════════
  searchControl = new FormControl('');

  // ═════════════════════════════════════════════════════════════
  // CLEANUP PARA SUSCRIPCIONES RXJS
  // ═════════════════════════════════════════════════════════════
  private destroy$ = new Subject<void>();

  // ═════════════════════════════════════════════════════════════
  // COMPUTED: Mensaje para estado vacío
  // ═════════════════════════════════════════════════════════════
  emptyMessage = computed(() => {
    if (!this.currentQuery()) return 'Escribe el nombre de un anime para buscar';
    if (this.loading()) return 'Buscando...';
    if (this.error()) return this.error();
    return 'No se encontraron resultados para "' + this.currentQuery() + '"';
  });

  getAnimeSearchClasses(): string {
    return this.themeService.isDarkMode()
      ? 'text-white' // Dark mode
      : 'text-gray-900'; // Light mode
  }

  getAnimeSearchBGClasses(): string {
    return this.themeService.isDarkMode()
      ? 'bg-gray-900' // Dark mode
      : 'bg-gray-50'; // Light mode
  }

  ngOnInit(): void {
    // ✅ Suscribirse a cambios en el input con DEBOUNCE
    this.searchControl.valueChanges
      .pipe(
        debounceTime(400), // ← Esperar 400ms después de dejar de escribir
        distinctUntilChanged(), // ← Ignorar si el valor no cambió
        takeUntil(this.destroy$), // ← Limpiar suscripción al destruir
      )
      .subscribe((query) => {
        const searchTerm = query || '';
        this.currentQuery.set(searchTerm);
        this.currentPage.set(1); // Resetear paginación al buscar

        if (searchTerm.length >= 2) {
          this.performSearch(searchTerm, 1);
        } else {
          this.searchResults.set([]);
          this.totalResults.set(0);
        }
      });

    // ✅ Leer query de URL si existe: /search?q=naruto
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const queryFromUrl = params['q'];
      if (queryFromUrl && queryFromUrl.length >= 2) {
        this.searchControl.setValue(queryFromUrl);
        // El valueChanges subscription ya se encargará de buscar
      }
    });
  }

  ngOnDestroy(): void {
    // ✅ Limpiar suscripciones para evitar memory leaks
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ═════════════════════════════════════════════════════════════
  // MÉTODO PRINCIPAL: EJECUTAR BÚSQUEDA
  // ═════════════════════════════════════════════════════════════
  performSearch(query: string, page: number = 1): void {
    if (!query || query.trim().length < 2) return;

    this.loading.set(true);
    this.error.set(null);

    this.animeService.searchAnime(query.trim(), page).subscribe({
      next: (response) => {
        // Si es página 1, reemplazar resultados; si no, agregar (para infinite scroll futuro)
        if (page === 1) {
          this.searchResults.set(response.data);
        } else {
          this.searchResults.update((current) => [...current, ...response.data]);
        }

        this.hasNextPage.set(response.pagination.has_next_page);
        this.totalResults.set(response.pagination.items.total);
        this.loading.set(false);

        // ✅ Actualizar URL con el query (para compartir enlaces)
        this.updateUrlQuery(query);
      },
      error: (err) => {
        this.error.set('Error al buscar. Intenta de nuevo.');
        this.loading.set(false);
        console.error('Search error:', err);
      },
    });
  }

  // ═════════════════════════════════════════════════════════════
  // ACTUALIZAR URL CON EL QUERY (PARA COMPARTIR)
  // ═════════════════════════════════════════════════════════════
  private updateUrlQuery(query: string): void {
    // Solo en navegador
    if (typeof window === 'undefined') return;

    // Usar replaceState para no añadir entradas al historial por cada tecla
    const url = new URL(window.location.href);
    if (query) {
      url.searchParams.set('q', query);
    } else {
      url.searchParams.delete('q');
    }
    window.history.replaceState({}, '', url.toString());
  }

  // ═════════════════════════════════════════════════════════════
  // BÚSQUEDA POR TECLA ENTER (PARA USUARIOS QUE PREFIEREN)
  // ═════════════════════════════════════════════════════════════
  onSearchEnter(): void {
    const query = this.searchControl.value;
    if (query && query.length >= 2) {
      this.currentQuery.set(query);
      this.performSearch(query, 1);
    }
  }

  // ═════════════════════════════════════════════════════════════
  // LIMPIAR BÚSQUEDA
  // ═════════════════════════════════════════════════════════════
  clearSearch(): void {
    this.searchControl.setValue('');
    this.currentQuery.set('');
    this.searchResults.set([]);
    this.totalResults.set(0);
    this.updateUrlQuery('');
  }

  // ═════════════════════════════════════════════════════════════
  // PAGINACIÓN
  // ═════════════════════════════════════════════════════════════
  goToPage(page: number): void {
    if (page < 1 || (!this.hasNextPage() && page > 1)) return;

    this.currentPage.set(page);
    const query = this.searchControl.value;
    if (query && query.length >= 2) {
      this.performSearch(query, page);
      // Scroll suave al inicio de resultados
      document.querySelector('#search-results')?.scrollIntoView({ behavior: 'smooth' });
    }
  }

  nextPage(): void {
    this.goToPage(this.currentPage() + 1);
  }

  prevPage(): void {
    this.goToPage(this.currentPage() - 1);
  }

  changePage(page: number): void {
    if (page < 1) return;
    this.currentPage.set(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.loadAnime();
  }

  loadAnime(): void {
    this.loading.set(true);
    this.error.set(null);

    this.animeService.getTopAnime(this.currentPage()).subscribe({
      next: (response) => {
        this.searchResults.set(response.data);
        this.hasNextPage.set(response.pagination.has_next_page);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('The anime could not be loaded. Please try again later.');
        this.loading.set(false);
        console.error('Error API:', err);
      },
    });
  }
}
