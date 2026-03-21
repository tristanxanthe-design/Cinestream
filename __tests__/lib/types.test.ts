import type { Movie, TVShow, Season, Episode, Cast, Video, WatchlistItem, HistoryItem, TMDBResponse } from '@/lib/types'

// Compile-time tests — if these type assertions compile, the types are correct
describe('types', () => {
  it('Movie has required fields', () => {
    const movie: Movie = {
      id: 1,
      title: 'Test',
      overview: 'desc',
      poster_path: '/path.jpg',
      backdrop_path: '/back.jpg',
      vote_average: 7.5,
      release_date: '2024-01-01',
      genre_ids: [28],
      media_type: 'movie',
    }
    expect(movie.id).toBe(1)
  })

  it('TVShow has required fields', () => {
    const show: TVShow = {
      id: 2,
      name: 'Test Show',
      overview: 'desc',
      poster_path: null,
      backdrop_path: null,
      vote_average: 8.0,
      first_air_date: '2024-01-01',
      genre_ids: [18],
      media_type: 'tv',
    }
    expect(show.id).toBe(2)
  })

  it('WatchlistItem has required fields', () => {
    const item: WatchlistItem = {
      id: 1,
      type: 'movie',
      title: 'Test',
      poster_path: null,
      vote_average: 7.0,
      addedAt: new Date().toISOString(),
    }
    expect(item.type).toBe('movie')
  })

  it('Season has required fields', () => {
    const season: Season = {
      id: 1,
      season_number: 1,
      name: 'Season 1',
      episode_count: 10,
      poster_path: null,
      air_date: '2024-01-01',
    }
    expect(season.season_number).toBe(1)
  })

  it('Episode has required fields', () => {
    const ep: Episode = {
      id: 1,
      episode_number: 1,
      season_number: 1,
      name: 'Pilot',
      overview: 'First episode',
      still_path: null,
      air_date: null,
      vote_average: 8.0,
    }
    expect(ep.episode_number).toBe(1)
  })

  it('Cast has required fields', () => {
    const member: Cast = {
      id: 1,
      name: 'Actor Name',
      character: 'Hero',
      profile_path: null,
      order: 0,
    }
    expect(member.order).toBe(0)
  })

  it('Video has required fields with correct types', () => {
    const video: Video = {
      id: 'abc123',
      key: 'dQw4w9WgXcQ',
      name: 'Official Trailer',
      site: 'YouTube',
      type: 'Trailer',
    }
    expect(video.site).toBe('YouTube')
  })

  it('HistoryItem has required fields', () => {
    const item: HistoryItem = {
      id: 1,
      type: 'tv',
      title: 'Test Show',
      poster_path: null,
      season: 1,
      episode: 3,
      watchedAt: new Date().toISOString(),
    }
    expect(item.type).toBe('tv')
  })

  it('TMDBResponse wraps results correctly', () => {
    const response: TMDBResponse<Movie> = {
      results: [],
      page: 1,
      total_pages: 10,
      total_results: 100,
    }
    expect(response.total_pages).toBe(10)
  })
})
