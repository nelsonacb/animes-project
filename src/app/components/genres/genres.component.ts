import { Component, inject, OnInit, signal, computed, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { Subject, takeUntil } from 'rxjs';
import { AnimeService } from '../../services/anime.service';
import { Anime, Genre } from '../../interfaces';
import { AnimeCardComponent } from '../shared/anime-card/anime-card.component';
import { UiLoadingComponent } from '../shared/ui-loading/ui-loading.component';
import { UiErrorComponent } from '../shared/ui-error/ui-error.component';
import { UiPaginationComponent } from '../shared/ui-pagination/ui-pagination.component';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-genres',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatFormFieldModule,
    MatSelectModule,
    AnimeCardComponent,
    UiLoadingComponent,
    UiErrorComponent,
    UiPaginationComponent,
  ],
  templateUrl: './genres.component.html',
  styleUrls: ['./genres.component.css'],
})
export class GenresComponent implements OnInit, OnDestroy {
  private animeService = inject(AnimeService);
  private route = inject(ActivatedRoute);
  private themeService = inject(ThemeService);

  genres = signal<Genre[]>([]);
  animes = signal<Anime[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  selectedGenreId = signal<number | null>(null);

  currentPage = signal(1);
  hasNextPage = signal(false);

  viewTitle = computed(() => {
    if (this.selectedGenreId()) {
      const genre = this.genres().find((g) => g.mal_id === this.selectedGenreId());
      return genre ? `Género: ${genre.name}` : 'Géneros';
    }
    return 'Todos los Géneros';
  });

  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.loadGenres();

    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const genreId = params['genre'];
      if (genreId && !isNaN(Number(genreId))) {
        this.selectedGenreId.set(Number(genreId));
        this.loadAnimeByGenre(Number(genreId));
      } else {
        this.selectedGenreId.set(null);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadGenres(): void {
    this.loading.set(true);

    this.animeService.getGenres().subscribe({
      next: (response) => {
        this.genres.set(response.data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message);
        this.loading.set(false);
      },
    });
  }

  loadAnimeByGenre(genreId: number, page: number = 1): void {
    this.loading.set(true);
    this.error.set(null);

    this.animeService.getAnimeByGenre(genreId, page).subscribe({
      next: (response) => {
        this.animes.set(response.data);
        this.hasNextPage.set(response.pagination?.has_next_page ?? false);
        this.currentPage.set(page);
        this.loading.set(false);
        this.updateUrl(genreId);
      },
      error: (err) => {
        this.error.set(err.message);
        this.loading.set(false);
      },
    });
  }

  selectGenre(genreId: number): void {
    this.selectedGenreId.set(genreId);
    this.currentPage.set(1);
    this.loadAnimeByGenre(genreId, 1);
  }

  clearGenreFilter(): void {
    this.selectedGenreId.set(null);
    this.animes.set([]);
    this.updateUrl(null);
  }

  private updateUrl(genreId: number | null): void {
    if (typeof window === 'undefined') return;

    const url = genreId ? `/genres?genre=${genreId}` : '/genres';

    window.history.pushState({}, '', url);
  }

  onPageChanged(page: number): void {
    if (this.selectedGenreId()) {
      this.loadAnimeByGenre(this.selectedGenreId()!, page);
    }
    document.querySelector('#genre-results')?.scrollIntoView({ behavior: 'smooth' });
  }

  getGenreColor(genreId: number): 'primary' | 'accent' | 'warn' | undefined {
    if (this.selectedGenreId() === genreId) return 'primary';
    return undefined;
  }

  getAnimeGenreClasses(): string {
    return this.themeService.isDarkMode()
      ? 'text-white' // Dark mode
      : 'text-gray-900'; // Light mode
  }

  getAnimeGenreBGClasses(): string {
    return this.themeService.isDarkMode()
      ? 'bg-gray-900' // Dark mode
      : 'bg-gray-50'; // Light mode
  }
}
