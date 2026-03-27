import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { environment } from '../../environments/environment.template';
import { AnimeResponse, Anime, TopAnimeResponse } from '../interfaces';

@Injectable({ providedIn: 'root' })
export class AnimeService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // ═══════════════════════════════════════════════════════════════
  // MÉTODO PRIVADO: Manejo centralizado de errores
  // ═══════════════════════════════════════════════════════════════
  private handleError(error: HttpErrorResponse) {
    // ✅ Log para debugging (solo en desarrollo)
    if (!environment.production) {
      console.warn('⚠️ AnimeService error:', {
        status: error.status,
        message: error.message,
        url: error.url,
      });
    }

    // ✅ Mensajes amigables según el tipo de error
    let userMessage = 'Error al cargar datos. Intenta más tarde.';

    if (error.status === 0) {
      userMessage = 'Sin conexión. Verifica tu internet.';
    } else if (error.status === 429) {
      // Jikan API rate limit: 3 req/seg, 60 req/min
      userMessage = 'Demasiadas peticiones. Espera un minuto e intenta de nuevo.';
    } else if (error.status === 404) {
      userMessage = 'No se encontró el recurso solicitado.';
    } else if (error.status >= 500) {
      userMessage = 'Error del servidor. Intenta más tarde.';
    }

    // ✅ Retornar error observable con mensaje útil
    return throwError(() => new Error(userMessage));
  }

  // ═══════════════════════════════════════════════════════════════
  // MÉTODO: Top Anime con paginación
  // ═══════════════════════════════════════════════════════════════
  getTopAnime(page: number = 1, limit: number = 25): Observable<TopAnimeResponse> {
    // ✅ Validación básica de parámetros
    if (page < 1) page = 1;
    if (limit < 1 || limit > 25) limit = 25; // Jikan max: 25 por página

    const params = new HttpParams().set('page', page.toString()).set('limit', limit.toString());

    return this.http.get<TopAnimeResponse>(`${this.apiUrl}/top/anime`, { params }).pipe(
      // ✅ Log opcional para tracking (remover en producción si no se necesita)
      tap((response) => {
        if (!environment.production) {
          console.log(`📊 Top anime: página ${page}, ${response.data?.length || 0} resultados`);
        }
      }),
      catchError(this.handleError),
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // MÉTODO: Búsqueda de anime
  // ═══════════════════════════════════════════════════════════════
  searchAnime(query: string, page: number = 1): Observable<TopAnimeResponse> {
    // ✅ Validar query ANTES de hacer petición (ahorra datos y evita errores)
    if (!query || query.trim().length < 2) {
      // Retornar respuesta vacía válida en lugar de error
      return throwError(() => new Error('La búsqueda debe tener al menos 2 caracteres'));
    }

    const params = new HttpParams()
      .set('q', query.trim())
      .set('page', page.toString())
      .set('limit', '25'); // Limit fijo para búsqueda

    return this.http.get<TopAnimeResponse>(`${this.apiUrl}/anime`, { params }).pipe(
      tap((response) => {
        if (!environment.production) {
          console.log(`🔍 Search "${query}": ${response.data?.length || 0} resultados`);
        }
      }),
      catchError(this.handleError),
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // MÉTODO: Detalle de anime por ID
  // ═══════════════════════════════════════════════════════════════
  getAnimeById(id: number): Observable<{ data: Anime }> {
    // ✅ Validar ID
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

  // Agregar el parámetro de página al método de temporada
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

  // ═══════════════════════════════════════════════════════════════
  // MÉTODO: Obtener temporada actual (helper)
  // ═══════════════════════════════════════════════════════════════
  getCurrentSeason(): { year: number; season: 'winter' | 'spring' | 'summer' | 'fall' } {
    const now = new Date();
    const month = now.getMonth() + 1; // 1-12
    const year = now.getFullYear();

    let season: 'winter' | 'spring' | 'summer' | 'fall';

    // ✅ Definición de temporadas (Jikan API usa este estándar)
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

  // ═══════════════════════════════════════════════════════════════
  // MÉTODO: Obtener lista de años disponibles (opcional)
  // ═══════════════════════════════════════════════════════════════
  getAvailableYears(): number[] {
    const currentYear = new Date().getFullYear();
    // Generar años desde 2000 hasta el próximo año
    return Array.from({ length: currentYear + 2 - 2000 }, (_, i) => 2000 + i);
  }

  // ═══════════════════════════════════════════════════════════════
  // MÉTODO: Obtener temporadas disponibles (constante)
  // ═══════════════════════════════════════════════════════════════
  getAvailableSeasons(): { value: 'winter' | 'spring' | 'summer' | 'fall'; label: string }[] {
    return [
      { value: 'winter', label: 'Invierno (Ene-Mar)' },
      { value: 'spring', label: 'Primavera (Abr-Jun)' },
      { value: 'summer', label: 'Verano (Jul-Sep)' },
      { value: 'fall', label: 'Otoño (Oct-Dic)' },
    ];
  }
}
