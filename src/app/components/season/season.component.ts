import { Component, inject, OnInit, signal, computed, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { Subject, takeUntil } from 'rxjs';
import { AnimeService } from '../../services/anime.service';
import { Anime } from '../../interfaces';
import { AnimeCardComponent } from '../shared/anime-card/anime-card.component';
import { UiLoadingComponent } from '../shared/ui-loading/ui-loading.component';
import { UiErrorComponent } from '../shared/ui-error/ui-error.component';
import { UiPaginationComponent } from '../shared/ui-pagination/ui-pagination.component';
import { ThemeService } from '../../services/theme.service';

type SeasonType = 'winter' | 'spring' | 'summer' | 'fall';

@Component({
  selector: 'app-season',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    AnimeCardComponent,
    UiLoadingComponent,
    UiErrorComponent,
    UiPaginationComponent,
  ],
  templateUrl: './season.component.html',
  styleUrls: ['./season.component.css'],
})
export class SeasonComponent implements OnInit, OnDestroy {
  private animeService = inject(AnimeService);
  private route = inject(ActivatedRoute);
  private themeService = inject(ThemeService);

  animes = signal<Anime[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  selectedYear = signal<number>(new Date().getFullYear());
  selectedSeason = signal<SeasonType>('winter');

  currentSeasonInfo = signal<{ year: number; season: SeasonType } | null>(null);

  currentPage = signal(1);
  hasNextPage = signal(false);

  availableYears = this.animeService.getAvailableYears();
  availableSeasons = this.animeService.getAvailableSeasons();

  getAnimeSeasonClasses(): string {
    return this.themeService.isDarkMode()
      ? 'text-white' // Dark mode
      : 'text-gray-900'; // Light mode
  }

  getAnimeSeasonBGClasses(): string {
    return this.themeService.isDarkMode()
      ? 'bg-gray-900' // Dark mode
      : 'bg-gray-50'; // Light mode
  }

  seasonTitle = computed(() => {
    const seasonLabels: Record<SeasonType, string> = {
      winter: 'Invierno',
      spring: 'Primavera',
      summer: 'Verano',
      fall: 'Otoño',
    };
    return `${seasonLabels[this.selectedSeason()]} ${this.selectedYear()}`;
  });

  isCurrentSeason = computed(() => {
    const current = this.currentSeasonInfo();
    if (!current) return false;
    return current.year === this.selectedYear() && current.season === this.selectedSeason();
  });

  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.currentSeasonInfo.set(this.animeService.getCurrentSeason());

    this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const yearFromUrl = params['year'];
      const seasonFromUrl = params['name'];

      if (yearFromUrl && !isNaN(Number(yearFromUrl))) {
        this.selectedYear.set(Number(yearFromUrl));
      } else {
        this.selectedYear.set(this.currentSeasonInfo()?.year || new Date().getFullYear());
      }

      if (seasonFromUrl && ['winter', 'spring', 'summer', 'fall'].includes(seasonFromUrl)) {
        this.selectedSeason.set(seasonFromUrl as SeasonType);
      } else {
        this.selectedSeason.set(this.currentSeasonInfo()?.season || 'winter');
      }

      this.loadSeasonAnime();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadSeasonAnime(): void {
    this.loading.set(true);
    this.error.set(null);

    this.animeService
      .getAnimeBySeason(this.selectedYear(), this.selectedSeason(), this.currentPage())
      .subscribe({
        next: (response) => {
          this.animes.set(response.data);
          this.hasNextPage.set(response.pagination?.has_next_page ?? false);
          this.loading.set(false);
          this.updateUrl();
        },
        error: (err) => {
          this.error.set(err.message);
          this.loading.set(false);
        },
      });
  }

  private updateUrl(): void {
    if (typeof window === 'undefined') return;
    const url = `/season/${this.selectedYear()}/${this.selectedSeason()}`;
    window.history.pushState({}, '', url);
  }

  onYearChange(year: number): void {
    this.selectedYear.set(year);
    this.currentPage.set(1);
    this.loadSeasonAnime();
  }

  onSeasonChange(season: SeasonType): void {
    this.selectedSeason.set(season);
    this.currentPage.set(1);
    this.loadSeasonAnime();
  }

  goToCurrentSeason(): void {
    const current = this.currentSeasonInfo();
    if (current) {
      this.selectedYear.set(current.year);
      this.selectedSeason.set(current.season);
      this.currentPage.set(1);
      this.loadSeasonAnime();
    }
  }

  onPageChanged(page: number): void {
    this.currentPage.set(page);
    this.loadSeasonAnime();
    document.querySelector('#season-results')?.scrollIntoView({ behavior: 'smooth' });
  }

  getSeasonLabel(season: SeasonType): string {
    const labels: Record<SeasonType, string> = {
      winter: 'Invierno',
      spring: 'Primavera',
      summer: 'Verano',
      fall: 'Otoño',
    };
    return labels[season];
  }

  getSeasonIcon(season: SeasonType): string {
    const icons: Record<SeasonType, string> = {
      winter: 'ac_unit',
      spring: 'local_florist',
      summer: 'wb_sunny',
      fall: 'nature_people',
    };
    return icons[season];
  }
}
