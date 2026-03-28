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

export function getUpcoming(page = 1) {
  return tmdbFetch<TMDBResponse<Movie>>('/movie/upcoming', { page })
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

export interface CollectionDetails {
  id: number
  name: string
  overview: string
  backdrop_path: string | null
  poster_path: string | null
  parts: Array<{
    id: number
    title: string
    overview: string
    poster_path: string | null
    backdrop_path: string | null
    release_date?: string
    vote_average: number
    media_type: 'movie'
  }>
}

export function getCollection(id: number): Promise<CollectionDetails> {
  return tmdbFetch(`/collection/${id}`)
}

export interface Person {
  id: number
  name: string
  profile_path: string | null
  known_for_department: string
  biography?: string
  birthday?: string | null
  place_of_birth?: string | null
  popularity: number
}

export interface CreditItem {
  id: number
  title?: string
  name?: string
  poster_path: string | null
  media_type: 'movie' | 'tv'
  vote_average: number
  release_date?: string
  first_air_date?: string
  popularity: number
}

export function getTrendingPeople(): Promise<TMDBResponse<Person>> {
  return tmdbFetch('/trending/person/week')
}

export function getPersonDetails(id: number): Promise<Person> {
  return tmdbFetch(`/person/${id}`)
}

export function getPersonCredits(id: number): Promise<{ cast: CreditItem[] }> {
  return tmdbFetch(`/person/${id}/combined_credits`)
}
