export interface Movie {
  id: number
  title: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  vote_average: number
  release_date?: string
  genre_ids: number[]
  media_type: 'movie'
  tagline?: string
  runtime?: number
  genres?: Genre[]
}

export interface TVShow {
  id: number
  name: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  vote_average: number
  first_air_date?: string
  genre_ids: number[]
  media_type: 'tv'
  tagline?: string
  number_of_seasons?: number
  genres?: Genre[]
}

export type MediaItem = Movie | TVShow

export interface Season {
  id: number
  season_number: number
  name: string
  episode_count: number
  poster_path: string | null
  air_date: string | null
}

export interface Episode {
  id: number
  episode_number: number
  season_number: number
  name: string
  overview: string
  still_path: string | null
  air_date: string | null
  vote_average: number
}

export interface Cast {
  id: number
  name: string
  character: string
  profile_path: string | null
  order: number
}

export interface Video {
  id: string
  key: string
  name: string
  site: 'YouTube' | 'Vimeo'
  type: 'Trailer' | 'Teaser' | 'Clip' | 'Featurette' | 'Behind the Scenes' | 'Bloopers'
}

export interface Genre {
  id: number
  name: string
}

export interface WatchlistItem {
  id: number
  type: 'movie' | 'tv'
  title: string
  poster_path: string | null
  vote_average: number
  addedAt: string
}

export interface HistoryItem {
  id: number
  type: 'movie' | 'tv'
  title: string
  poster_path: string | null
  season?: number
  episode?: number
  watchedAt: string
}

export interface TMDBResponse<T> {
  results: T[]
  page: number
  total_pages: number
  total_results: number
}
