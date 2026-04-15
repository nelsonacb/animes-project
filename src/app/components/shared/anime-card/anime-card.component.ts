import { ChangeDetectionStrategy, Component, inject, Input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ThemeService } from '../../../services/theme.service';
import { Anime } from '../../../interfaces';

@Component({
  selector: 'app-anime-card',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatChipsModule,
    MatSnackBarModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './anime-card.component.html',
  styleUrls: ['./anime-card.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnimeCardComponent {
  private themeService = inject(ThemeService);
  private snackBar = inject(MatSnackBar);

  @Input({ required: true }) anime!: Anime;

  @Input() showRank = true;

  @Input() maxGenres = 2;

  @Input() showFavoriteButton = true;

  getAnimeCardClasses(): string {
    return this.themeService.isDarkMode()
      ? 'text-white' // Dark mode
      : 'text-gray-900'; // Light mode
  }

  get truncatedSynopsis(): string {
    if (!this.anime.synopsis) return 'Sin sinopsis disponible.';
    return this.anime.synopsis.length > 100
      ? this.anime.synopsis.slice(0, 100) + '...'
      : this.anime.synopsis;
  }

  getImageUrl(): string {
    return (
      this.anime.images?.jpg?.large_image_url ||
      this.anime.images?.jpg?.image_url ||
      'assets/placeholder-anime.jpg'
    );
  }
}
