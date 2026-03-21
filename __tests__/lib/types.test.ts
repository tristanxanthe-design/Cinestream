import type { Movie, TVShow, Season, Episode, Cast, Video, WatchlistItem, HistoryItem } from '@/lib/types'

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
})
