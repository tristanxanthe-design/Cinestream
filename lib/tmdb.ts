import type { Movie, TVShow, Season, Episode, Cast, Video, Genre, TMDBResponse } from './types'

const BASE = 'https://api.themoviedb.org/3'

function apiKey() {
  return process.env.NEXT_PUBLIC_TMDB_API_KEY ?? ''
}

async function tmdbFetch<T>(path: string, params: Record<string, string | number> = {}): Promise<T> {
  const url = new URL(`${BASE}${path}`)
  url.searchParams.set('api_key', apiKey())
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, String(v))
  }
  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`TMDB API error: ${res.status}`)
  return res.json()
}

export function getTrending(mediaType: 'movie' | 'tv', timeWindow: 'day' | 'week') {
  return tmdbFetch<TMDBResponse<Movie | TVShow>>(`/trending/${mediaType}/${timeWindow}`)
}

export function getPopular(mediaType: 'movie' | 'tv', page = 1) {
  const endpoint = mediaType === 'movie' ? '/movie/popular' : '/tv/popular'
  return tmdbFetch<TMDBResponse<Movie | TVShow>>(endpoint, { page })
}

export function getTopRated(mediaType: 'movie' | 'tv', page = 1) {
  const endpoint = mediaType === 'movie' ? '/movie/top_rated' : '/tv/top_rated'
  return tmdbFetch<TMDBResponse<Movie | TVShow>>(endpoint, { page })
}

export function getNowPlaying(page = 1) {
  return tmdbFetch<TMDBResponse<Movie>>('/movie/now_playing', { page })
}

export function getOnTheAir(page = 1) {
  return tmdbFetch<TMDBResponse<TVShow>>('/tv/on_the_air', { page })
}

export function getDetails(mediaType: 'movie' | 'tv', id: number) {
  return tmdbFetch<Movie | TVShow>(`/${mediaType}/${id}`)
}

export function getCredits(mediaType: 'movie' | 'tv', id: number): Promise<{ cast: Cast[] }> {
  return tmdbFetch(`/${mediaType}/${id}/credits`)
}

export function getSimilar(mediaType: 'movie' | 'tv', id: number) {
  return tmdbFetch<TMDBResponse<Movie | TVShow>>(`/${mediaType}/${id}/similar`)
}

export function getVideos(mediaType: 'movie' | 'tv', id: number): Promise<{ results: Video[] }> {
  return tmdbFetch(`/${mediaType}/${id}/videos`)
}

export function getSeasonDetails(tvId: number, seasonNumber: number): Promise<{ id: number; season_number: number; episodes: Episode[] }> {
  return tmdbFetch(`/tv/${tvId}/season/${seasonNumber}`)
}

export function searchMulti(query: string, page = 1) {
  // Pass raw query — URLSearchParams encodes spaces as '+' automatically
  return tmdbFetch<TMDBResponse<Movie | TVShow>>('/search/multi', {
    query,
    page,
  })
}

export function discoverByGenre(mediaType: 'movie' | 'tv', genreId: number, page = 1) {
  return tmdbFetch<TMDBResponse<Movie | TVShow>>(`/discover/${mediaType}`, {
    with_genres: genreId,
    page,
  })
}

export function getGenres(mediaType: 'movie' | 'tv'): Promise<{ genres: Genre[] }> {
  return tmdbFetch(`/genre/${mediaType}/list`)
}
