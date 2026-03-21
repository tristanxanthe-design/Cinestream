import {
  getTrending, getPopular, getTopRated, getNowPlaying, getOnTheAir,
  getDetails, getCredits, getSimilar, getVideos, getSeasonDetails,
  searchMulti, discoverByGenre, getGenres,
} from '@/lib/tmdb'

const mockFetch = jest.fn()
global.fetch = mockFetch

const mockTMDBResponse = { results: [{ id: 1, title: 'Test' }], page: 1, total_pages: 1, total_results: 1 }
const mockMovieDetail = { id: 1, title: 'Test', overview: 'desc', poster_path: null, backdrop_path: null, vote_average: 7, genre_ids: [], media_type: 'movie' }
const mockCredits = { cast: [], crew: [] }
const mockVideos = { results: [] }
const mockSeason = { id: 1, season_number: 1, episodes: [] }

beforeEach(() => {
  mockFetch.mockReset()
  process.env.NEXT_PUBLIC_TMDB_API_KEY = 'test_key'
})

function mockSuccess(data: unknown) {
  mockFetch.mockResolvedValueOnce({ ok: true, json: async () => data } as Response)
}

describe('getTrending', () => {
  it('calls correct endpoint', async () => {
    mockSuccess(mockTMDBResponse)
    await getTrending('movie', 'day')
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/trending/movie/day')
    )
  })

  it('includes api_key', async () => {
    mockSuccess(mockTMDBResponse)
    await getTrending('tv', 'week')
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('api_key=test_key')
    )
  })

  it('returns results array', async () => {
    mockSuccess(mockTMDBResponse)
    const result = await getTrending('movie', 'day')
    expect(result.results).toHaveLength(1)
  })
})

describe('getPopular', () => {
  it('calls correct endpoint with page', async () => {
    mockSuccess(mockTMDBResponse)
    await getPopular('movie', 2)
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/movie/popular'))
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('page=2'))
  })
})

describe('getDetails', () => {
  it('fetches movie details', async () => {
    mockSuccess(mockMovieDetail)
    const result = await getDetails('movie', 1)
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/movie/1'))
    expect(result.id).toBe(1)
  })
})

describe('searchMulti', () => {
  it('encodes query in URL', async () => {
    mockSuccess(mockTMDBResponse)
    await searchMulti('hello world')
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('query=hello+world')
    )
  })
})

describe('getSeasonDetails', () => {
  it('calls tv season endpoint', async () => {
    mockSuccess(mockSeason)
    await getSeasonDetails(42, 2)
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/tv/42/season/2'))
  })
})

describe('error handling', () => {
  it('throws when API response is not ok', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 401 } as Response)
    await expect(getTrending('movie', 'day')).rejects.toThrow('TMDB API error: 401')
  })
})
