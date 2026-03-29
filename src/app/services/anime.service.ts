import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment.template';
import { AnimeResponse, Anime, TopAnimeResponse, GenreResponse } from '../interfaces';

@Injectable({ providedIn: 'root' })
export class AnimeService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  private handleError(error: HttpErrorResponse) {
    if (!environment.production) {
      console.warn('⚠️ AnimeService error:', {
        status: error.status,
        message: error.message,
        url: error.url,
      });
    }

    let userMessage = 'Error al cargar datos. Intenta más tarde.';

    if (error.status === 0) {
      userMessage = 'Sin conexión. Verifica tu internet.';
    } else if (error.status === 429) {
      userMessage = 'Demasiadas peticiones. Espera un minuto e intenta de nuevo.';
    } else if (error.status === 404) {
      userMessage = 'No se encontró el recurso solicitado.';
    } else if (error.status >= 500) {
      userMessage = 'Error del servidor. Intenta más tarde.';
    }

    return throwError(() => new Error(userMessage));
  }

  getTopAnime(page: number = 1, limit: number = 25): Observable<TopAnimeResponse> {
    if (page < 1) page = 1;
    if (limit < 1 || limit > 25) limit = 25;

    const params = new HttpParams().set('page', page.toString()).set('limit', limit.toString());

    return this.http.get<TopAnimeResponse>(`${this.apiUrl}/top/anime`, { params }).pipe(
      tap((response) => {
        if (!environment.production) {
          console.log(`📊 Top anime: página ${page}, ${response.data?.length || 0} resultados`);
        }
      }),
      catchError(this.handleError),
    );
  }

  searchAnime(query: string, page: number = 1): Observable<TopAnimeResponse> {
    if (!query || query.trim().length < 2) {
      return throwError(() => new Error('La búsqueda debe tener al menos 2 caracteres'));
    }

    const params = new HttpParams()
      .set('q', query.trim())
      .set('page', page.toString())
      .set('limit', '25');

    return this.http.get<TopAnimeResponse>(`${this.apiUrl}/anime`, { params }).pipe(
      tap((response) => {
        if (!environment.production) {
          console.log(`🔍 Search "${query}": ${response.data?.length || 0} resultados`);
        }
      }),
      catchError(this.handleError),
    );
  }

  getAnimeById(id: number): Observable<{ data: Anime }> {
    if (!id || id < 1 || !Number.isInteger(id)) {
      return throwError(() => new Error('ID de anime inválido'));
    }

    return this.http.get<{ data: Anime }>(`${this.apiUrl}/anime/${id}/full`).pipe(
      tap((response) => {
        if (!environment.production) {
          console.log(`📺 Anime #${id}: ${response.data?.title || 'Unknown'}`);
        }
      }),
      catchError(this.handleError),
    );
  }

  getAnimeBySeason(
    year: number,
    season: 'winter' | 'spring' | 'summer' | 'fall',
    page: number = 1,
  ): Observable<TopAnimeResponse> {
    const currentYear = new Date().getFullYear();
    if (year < 2000 || year > currentYear + 1) {
      return throwError(() => new Error('Año de temporada inválido'));
    }

    const validSeasons = ['winter', 'spring', 'summer', 'fall'];
    if (!validSeasons.includes(season)) {
      return throwError(() => new Error('Temporada inválida'));
    }

    const params = new HttpParams().set('page', page.toString()).set('limit', '25');

    return this.http
      .get<TopAnimeResponse>(`${this.apiUrl}/seasons/${year}/${season}`, { params })
      .pipe(
        tap((response) => {
          if (!environment.production) {
            console.log(
              `📅 Season ${season} ${year} (página ${page}): ${response.data?.length || 0} resultados`,
            );
          }
        }),
        catchError(this.handleError),
      );
  }

  getGenres(): Observable<GenreResponse> {
    return this.http.get<GenreResponse>(`${this.apiUrl}/genres/anime`).pipe(
      tap((response) => {
        if (!environment.production) {
          console.log(`🎭 Genres: ${response.data?.length || 0} géneros`);
        }
      }),
      catchError(this.handleError),
    );
  }

  getAnimeByGenre(genreId: number, page: number = 1): Observable<TopAnimeResponse> {
    if (!genreId || genreId < 1) {
      return throwError(() => new Error('ID de género inválido'));
    }

    const params = new HttpParams()
      .set('genres', genreId.toString())
      .set('page', page.toString())
      .set('limit', '25');

    return this.http.get<TopAnimeResponse>(`${this.apiUrl}/anime`, { params }).pipe(
      tap((response) => {
        if (!environment.production) {
          console.log(
            `🎭 Genre ${genreId} (página ${page}): ${response.data?.length || 0} resultados`,
          );
        }
      }),
      catchError(this.handleError),
    );
  }

  getCurrentSeason(): { year: number; season: 'winter' | 'spring' | 'summer' | 'fall' } {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    let season: 'winter' | 'spring' | 'summer' | 'fall';

    if (month >= 1 && month <= 3) {
      season = 'winter';
    } else if (month >= 4 && month <= 6) {
      season = 'spring';
    } else if (month >= 7 && month <= 9) {
      season = 'summer';
    } else {
      season = 'fall';
    }

    return { year, season };
  }

  getAvailableYears(): number[] {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: currentYear + 2 - 2000 }, (_, i) => 2000 + i);
  }

  getAvailableSeasons(): { value: 'winter' | 'spring' | 'summer' | 'fall'; label: string }[] {
    return [
      { value: 'winter', label: 'Invierno (Ene-Mar)' },
      { value: 'spring', label: 'Primavera (Abr-Jun)' },
      { value: 'summer', label: 'Verano (Jul-Sep)' },
      { value: 'fall', label: 'Otoño (Oct-Dic)' },
    ];
  }
}
