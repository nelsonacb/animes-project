import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/anime-list/anime-list.component').then((m) => m.AnimeListComponent),
    title: 'Top Anime - AnimeHub',
  },

  {
    path: 'anime/:id',
    loadComponent: () =>
      import('./components/anime-detail/anime-detail.component').then(
        (m) => m.AnimeDetailComponent,
      ),
    title: 'Detalle de Anime - AnimeHub',
  },

  {
    path: 'search',
    loadComponent: () =>
      import('./components/search/search.component').then((m) => m.SearchComponent),
    title: 'Buscar Anime - AnimeHub',
  },

  {
    path: 'season/:year/:name',
    loadComponent: () =>
      import('./components/season/season.component').then((m) => m.SeasonComponent),
    title: 'Anime por Temporada - AnimeHub',
  },

  {
    path: 'genres',
    loadComponent: () =>
      import('./components/genres/genres.component').then((m) => m.GenresComponent),
    title: 'Géneros de Anime - AnimeHub',
  },

  {
    path: 'favorites',
    loadComponent: () =>
      import('./components/favorites/favorites.component').then((m) => m.FavoritesComponent),
    title: 'Favorites Animes - AnimeHub',
  },

  {
    path: '**',
    redirectTo: '',
    title: 'Page Not Found - AnimeHub',
  },
];
