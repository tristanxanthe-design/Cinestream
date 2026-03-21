export const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p'

export function posterURL(
  path: string | null,
  size: 'w200' | 'w342' | 'w500' | 'original' = 'w342'
): string {
  if (!path) return '/placeholder-poster.svg'
  return `${TMDB_IMAGE_BASE}/${size}${path}`
}

export function backdropURL(
  path: string | null,
  size: 'w780' | 'w1280' | 'original' = 'w1280'
): string {
  if (!path) return '/placeholder-backdrop.svg'
  return `${TMDB_IMAGE_BASE}/${size}${path}`
}

export const MOVIE_GENRE_IDS: Record<number, string> = {
  28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy',
  80: 'Crime', 99: 'Documentary', 18: 'Drama', 10751: 'Family',
  14: 'Fantasy', 36: 'History', 27: 'Horror', 10402: 'Music',
  9648: 'Mystery', 10749: 'Romance', 878: 'Science Fiction',
  10770: 'TV Movie', 53: 'Thriller', 10752: 'War', 37: 'Western',
}

export const TV_GENRE_IDS: Record<number, string> = {
  10759: 'Action & Adventure', 16: 'Animation', 35: 'Comedy',
  80: 'Crime', 99: 'Documentary', 18: 'Drama', 10751: 'Family',
  10762: 'Kids', 9648: 'Mystery', 10763: 'News', 10764: 'Reality',
  10765: 'Sci-Fi & Fantasy', 10766: 'Soap', 10767: 'Talk',
  10768: 'War & Politics', 37: 'Western',
}
