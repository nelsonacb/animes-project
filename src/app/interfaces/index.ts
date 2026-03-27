export interface AnimeImage {
  jpg: { image_url: string; small_image_url?: string; large_image_url?: string };
  webp?: { image_url: string; small_image_url?: string; large_image_url?: string };
}

export interface AnimeGenre {
  mal_id: number;
  name: string;
}

export interface AnimeStudio {
  mal_id: number;
  name: string;
  url: string;
}

export interface Anime {
  mal_id: number;
  url: string;
  title: string;
  title_english: string | null;
  title_japanese: string;
  type: 'TV' | 'Movie' | 'OVA' | 'ONA' | 'Special' | 'Music';
  source: string;
  episodes: number | null;
  status: 'Currently Airing' | 'Finished Airing' | 'Not yet aired';
  airing: boolean;
  aired: {
    from: string | null;
    to: string | null;
    string: string;
  };
  duration: string;
  rating: 'G' | 'PG' | 'PG-13' | 'R' | 'R+' | 'Rx';
  score: number;
  scored_by: number;
  rank: number | null;
  popularity: number;
  members: number;
  favorites: number;
  synopsis: string | null;
  background: string | null;
  season: 'spring' | 'summer' | 'fall' | 'winter' | null;
  year: number | null;
  images: AnimeImage;
  genres: AnimeGenre[];
  studios: AnimeStudio[];
  themes: AnimeGenre[];
  demographics: AnimeGenre[];
}

export interface AnimeResponse {
  pagination: {
    last_visible_page: number;
    has_next_page: boolean;
    current_page: number;
    items: { count: number; total: number; per_page: number };
  };
  data: Anime[];
}

export interface PaginationInfo {
  last_visible_page: number;
  has_next_page: boolean;
  current_page: number;
  items: {
    count: number;
    total: number;
    per_page: number;
  };
}

export interface TopAnimeResponse {
  pagination: PaginationInfo;
  data: Anime[];
}
