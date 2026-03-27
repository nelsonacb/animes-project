import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AnimeService } from '../../services/anime.service';
import { ThemeService } from '../../services/theme.service';
import { Anime } from '../../interfaces';

@Component({
  selector: 'app-anime-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatProgressBarModule,
    MatChipsModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    DatePipe, // ← Para formatear fechas
  ],
  templateUrl: './anime-detail.component.html',
})
export class AnimeDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private animeService = inject(AnimeService);
  private themeService = inject(ThemeService);

  // Signals para estado reactivo
  anime = signal<Anime | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  getAnimeDetailClasses(): string {
    return this.themeService.isDarkMode()
      ? 'text-white' // Dark mode
      : 'text-gray-900'; // Light mode
  }

  getAnimeDetailBGClasses(): string {
    return this.themeService.isDarkMode()
      ? 'bg-gray-900' // Dark mode
      : 'bg-gray-50'; // Light mode
  }

  ngOnInit(): void {
    // Obtener el ID de la URL: /anime/:id
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = Number(idParam);

    if (!id || isNaN(id)) {
      this.error.set('ID de anime inválido');
      this.loading.set(false);
      return;
    }

    this.loadAnimeDetail(id);
  }

  private loadAnimeDetail(id: number): void {
    this.loading.set(true);
    this.error.set(null);

    this.animeService.getAnimeById(id).subscribe({
      next: (response) => {
        this.anime.set(response.data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message);
        this.loading.set(false);
      },
    });
  }
}
