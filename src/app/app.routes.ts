import { Routes } from '@angular/router';

export const routes: Routes = [
  // Home: Top Anime
  {
    path: '',
    loadComponent: () =>
      import('./components/anime-list/anime-list.component').then((m) => m.AnimeListComponent),
    title: 'Top Anime - AnimeHub',
  },

  // Detalle de Anime: /anime/:id
  {
    path: 'anime/:id',
    loadComponent: () =>
      import('./components/anime-detail/anime-detail.component').then(
        (m) => m.AnimeDetailComponent,
      ),
    title: 'Detalle de Anime - AnimeHub',
  },

  // Búsqueda: /search?q=...
  {
    path: 'search',
    loadComponent: () =>
      import('./components/search/search.component').then((m) => m.SearchComponent),
    title: 'Buscar Anime - AnimeHub',
  },

  // Temporadas: /season/:year/:name
  {
    path: 'season/:year/:name',
    loadComponent: () =>
      import('./components/season/season.component').then((m) => m.SeasonComponent),
    title: 'Anime por Temporada - AnimeHub',
  },

  //   // Géneros: /genres
  //   {
  //     path: 'genres',
  //     loadComponent: () =>
  //       import('./components/genres/genres.component').then((m) => m.GenresComponent),
  //     title: 'Géneros de Anime - AnimeHub',
  //   },

  //   // Favorites: /favorites
  //   {
  //     path: 'favorites',
  //     loadComponent: () =>
  //       import('./components/favorites/favorites.component').then((m) => m.FavoritesComponent),
  //     title: 'Favorites Animes - AnimeHub',
  //   },

  // Ruta no encontrada (404)
  {
    path: '**',
    redirectTo: '',
    title: 'Page Not Found - AnimeHub',
  },
];
