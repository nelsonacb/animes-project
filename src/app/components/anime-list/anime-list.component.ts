import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AnimeCardComponent } from '../shared/anime-card/anime-card.component';
import { AnimeService } from '../../services/anime.service';
import { UiLoadingComponent } from '../shared/ui-loading/ui-loading.component';
import { UiErrorComponent } from '../shared/ui-error/ui-error.component';
import { UiPaginationComponent } from '../shared/ui-pagination/ui-pagination.component';
import { Anime } from '../../interfaces';

@Component({
  selector: 'app-anime-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonModule,
    AnimeCardComponent,
    UiLoadingComponent,
    UiErrorComponent,
    UiPaginationComponent,
  ],
  templateUrl: './anime-list.component.html',
  styleUrls: ['./anime-list.component.css'],
})
export class AnimeListComponent implements OnInit {
  [x: string]: any;
  private animeService = inject(AnimeService);

  animes = signal<Anime[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  currentPage = signal(1);
  hasNextPage = signal(true);

  ngOnInit(): void {
    this.loadAnime();
  }

  loadAnime(): void {
    this.loading.set(true);
    this.error.set(null);

    this.animeService.getTopAnime(this.currentPage()).subscribe({
      next: (response) => {
        this.animes.set(response.data);
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

  changePage(page: number): void {
    if (page < 1) return;
    this.currentPage.set(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.loadAnime();
  }
}
