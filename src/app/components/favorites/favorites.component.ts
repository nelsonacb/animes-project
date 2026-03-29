import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FavoritesService } from '../../services/favorites.service';
import { AnimeCardComponent } from '../shared/anime-card/anime-card.component';
import { UiLoadingComponent } from '../shared/ui-loading/ui-loading.component';
import { UiErrorComponent } from '../shared/ui-error/ui-error.component';
import { Anime } from '../../interfaces';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatDialogModule,
    MatSnackBarModule,
    AnimeCardComponent,
    UiLoadingComponent,
    UiErrorComponent,
  ],
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.css'],
})
export class FavoritesComponent {
  private favoritesService = inject(FavoritesService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  loading = signal(false);
  error = signal<string | null>(null);

  favorites = computed(() => this.favoritesService.getFavorites());
  favoritesCount = computed(() => this.favoritesService.favoritesCount());

  emptyMessage = computed(() => {
    if (this.favoritesCount() === 0) {
      return 'No tienes animes favoritos aún';
    }
    return `${this.favoritesCount()} animes en favoritos`;
  });

  removeFavorite(animeId: number, animeTitle: string): void {
    this.favoritesService.removeFavorite(animeId);

    this.snackBar.open(`"${animeTitle}" removido de favoritos`, 'Cerrar', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    });
  }

  clearAllFavorites(): void {
    const confirmed = confirm(
      '¿Estás seguro de que quieres eliminar todos tus favoritos? Esta acción no se puede deshacer.',
    );

    if (confirmed) {
      this.favoritesService.clearFavorites();

      this.snackBar.open('Todos los favoritos han sido eliminados', 'Cerrar', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        panelClass: ['snackbar-info'],
      });
    }
  }

  onFavoriteChanged(event: { animeId: number; added: boolean }): void {}
}
