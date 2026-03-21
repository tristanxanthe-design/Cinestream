# CineStream Full Build Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a complete local Netflix-style streaming app (CineStream) using Next.js 14 that browses TMDB content and plays via a configurable iframe embed.

**Architecture:** Next.js 14 App Router with server components for TMDB data fetching and client components only for interactive elements (search, watchlist, episode picker). State persists in localStorage via a SSR-safe context provider. The player is a simple iframe whose URL is constructed from an env variable.

**Tech Stack:** Next.js 14 (App Router), TypeScript (strict), Tailwind CSS, Framer Motion, Lucide React, TMDB API v3, Jest + React Testing Library

---

## Pre-flight Check

Before starting, verify the TMDB API key is set:

```bash
cat .env.local
```

`NEXT_PUBLIC_TMDB_API_KEY` should NOT be `your_tmdb_key_here`. If it is, the user must get a free key from https://www.themoviedb.org/settings/api and update `.env.local`. The embed URL (`NEXT_PUBLIC_EMBED_BASE_URL`) is already set to `https://www.vidking.net` — that's fine.

---

## Phase 1 — Scaffolding, Types & TMDB Client

### Task 1: Bootstrap Next.js App

**Files:**
- Creates: entire project scaffold in `/c/CineStream/`

**Step 1: Create the Next.js app**

Run from `/c/CineStream/`:
```bash
npx create-next-app@14 . --typescript --tailwind --app --no-src-dir --import-alias "@/*" --yes
```

Answer prompts if asked:
- Use TypeScript: Yes
- Use ESLint: Yes
- Use Tailwind: Yes
- Use `src/` directory: **No** (CLAUDE.md uses root-level `app/`)
- Use App Router: Yes
- Customize import alias: Yes, use `@/*`

**Step 2: Install additional dependencies**

```bash
npm install framer-motion lucide-react
npm install --save-dev jest jest-environment-jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event @types/jest
```

**Step 3: Create Jest config**

Create `jest.config.ts`:
```typescript
import type { Config } from 'jest'
import nextJest from 'next/jest.js'

const createJestConfig = nextJest({ dir: './' })

const config: Config = {
  testEnvironment: 'jsdom',
  setupFilesAfterFramework: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
}

export default createJestConfig(config)
```

Create `jest.setup.ts`:
```typescript
import '@testing-library/jest-dom'
```

Add to `package.json` scripts:
```json
"test": "jest",
"test:watch": "jest --watch"
```

**Step 4: Verify jest runs**

```bash
npm test -- --passWithNoTests
```
Expected: PASS (no tests yet, exits 0)

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: bootstrap Next.js 14 app with testing setup"
```

---

### Task 2: TypeScript Types

**Files:**
- Create: `lib/types.ts`
- Test: `__tests__/lib/types.test.ts`

**Step 1: Write the types test (type-level test)**

Create `__tests__/lib/types.test.ts`:
```typescript
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
```

**Step 2: Run test to verify it fails**

```bash
npm test -- __tests__/lib/types.test.ts
```
Expected: FAIL — "Cannot find module '@/lib/types'"

**Step 3: Create `lib/types.ts`**

```typescript
export interface Movie {
  id: number
  title: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  vote_average: number
  release_date: string
  genre_ids: number[]
  media_type: 'movie'
  tagline?: string
  runtime?: number
  genres?: { id: number; name: string }[]
}

export interface TVShow {
  id: number
  name: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  vote_average: number
  first_air_date: string
  genre_ids: number[]
  media_type: 'tv'
  tagline?: string
  number_of_seasons?: number
  genres?: { id: number; name: string }[]
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
  site: string
  type: string
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
```

**Step 4: Run test to verify it passes**

```bash
npm test -- __tests__/lib/types.test.ts
```
Expected: PASS

**Step 5: Commit**

```bash
git add lib/types.ts __tests__/lib/types.test.ts jest.config.ts jest.setup.ts
git commit -m "feat: add TypeScript type definitions"
```

---

### Task 3: Constants & Image Helpers

**Files:**
- Create: `lib/constants.ts`
- Test: `__tests__/lib/constants.test.ts`

**Step 1: Write the failing test**

Create `__tests__/lib/constants.test.ts`:
```typescript
import { posterURL, backdropURL, TMDB_IMAGE_BASE } from '@/lib/constants'

describe('posterURL', () => {
  it('returns placeholder when path is null', () => {
    expect(posterURL(null)).toBe('/placeholder-poster.png')
  })

  it('returns correct URL with default size w342', () => {
    expect(posterURL('/abc.jpg')).toBe(`${TMDB_IMAGE_BASE}/w342/abc.jpg`)
  })

  it('returns correct URL with custom size', () => {
    expect(posterURL('/abc.jpg', 'w500')).toBe(`${TMDB_IMAGE_BASE}/w500/abc.jpg`)
  })
})

describe('backdropURL', () => {
  it('returns placeholder when path is null', () => {
    expect(backdropURL(null)).toBe('/placeholder-backdrop.png')
  })

  it('returns correct URL with default size w1280', () => {
    expect(backdropURL('/back.jpg')).toBe(`${TMDB_IMAGE_BASE}/w1280/back.jpg`)
  })
})
```

**Step 2: Run test to verify it fails**

```bash
npm test -- __tests__/lib/constants.test.ts
```
Expected: FAIL — "Cannot find module '@/lib/constants'"

**Step 3: Create `lib/constants.ts`**

```typescript
export const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p'

export function posterURL(
  path: string | null,
  size: 'w200' | 'w342' | 'w500' | 'original' = 'w342'
): string {
  if (!path) return '/placeholder-poster.png'
  return `${TMDB_IMAGE_BASE}/${size}${path}`
}

export function backdropURL(
  path: string | null,
  size: 'w780' | 'w1280' | 'original' = 'w1280'
): string {
  if (!path) return '/placeholder-backdrop.png'
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
```

**Step 4: Create placeholder images**

```bash
# Create placeholder SVGs in public/
```

Create `public/placeholder-poster.png` — just a 1x1 px gray PNG. The easiest approach: run the app and use Next.js's built-in image optimization. For now, create a minimal SVG placeholder:

Create `public/placeholder-poster.svg` with:
```svg
<svg width="342" height="513" viewBox="0 0 342 513" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="342" height="513" fill="#1a1a1a"/>
  <text x="171" y="260" text-anchor="middle" fill="#444" font-size="48">🎬</text>
</svg>
```

Create `public/placeholder-backdrop.svg` with:
```svg
<svg width="1280" height="720" viewBox="0 0 1280 720" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="1280" height="720" fill="#141414"/>
  <text x="640" y="365" text-anchor="middle" fill="#444" font-size="64">🎬</text>
</svg>
```

Update references in `lib/constants.ts` to use `.svg`:
```typescript
// Change placeholder filenames to .svg
if (!path) return '/placeholder-poster.svg'
// ...
if (!path) return '/placeholder-backdrop.svg'
```

**Step 5: Run test to verify it passes**

```bash
npm test -- __tests__/lib/constants.test.ts
```
Expected: PASS

**Step 6: Commit**

```bash
git add lib/constants.ts __tests__/lib/constants.test.ts public/placeholder-poster.svg public/placeholder-backdrop.svg
git commit -m "feat: add image helpers and placeholder assets"
```

---

### Task 4: TMDB API Client

**Files:**
- Create: `lib/tmdb.ts`
- Test: `__tests__/lib/tmdb.test.ts`

**Step 1: Write the failing tests**

Create `__tests__/lib/tmdb.test.ts`:
```typescript
import {
  getTrending, getPopular, getTopRated, getNowPlaying, getOnTheAir,
  getDetails, getCredits, getSimilar, getVideos, getSeasonDetails,
  searchMulti, discoverByGenre, getGenres,
} from '@/lib/tmdb'

const mockFetch = jest.fn()
global.fetch = mockFetch

const mockTMDBResponse = { results: [{ id: 1, title: 'Test' }], page: 1, total_pages: 1, total_results: 1 }
const mockMovieDetail = { id: 1, title: 'Test', overview: 'desc', poster_path: null, backdrop_path: null, vote_average: 7, release_date: '2024-01-01', genre_ids: [], media_type: 'movie' }
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
```

**Step 2: Run test to verify it fails**

```bash
npm test -- __tests__/lib/tmdb.test.ts
```
Expected: FAIL — "Cannot find module '@/lib/tmdb'"

**Step 3: Create `lib/tmdb.ts`**

```typescript
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
  return tmdbFetch<TMDBResponse<Movie | TVShow>>('/search/multi', {
    query: encodeURIComponent(query).replace(/%20/g, '+'),
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
```

**Step 4: Run tests to verify they pass**

```bash
npm test -- __tests__/lib/tmdb.test.ts
```
Expected: PASS (all tests green)

**Step 5: Commit**

```bash
git add lib/tmdb.ts __tests__/lib/tmdb.test.ts
git commit -m "feat: add TMDB API client with full endpoint coverage"
```

---

### Task 5: Configure Next.js for TMDB Images

**Files:**
- Modify: `next.config.js` (or `next.config.mjs`)

**Step 1: Read the existing config**

```bash
cat next.config.mjs
```

**Step 2: Update `next.config.mjs`**

Replace its content with:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
        pathname: '/t/p/**',
      },
    ],
  },
}

export default nextConfig
```

**Step 3: Verify the dev server starts**

```bash
npm run dev
```
Expected: Server starts on http://localhost:3000, no config errors. Stop with Ctrl+C.

**Step 4: Commit**

```bash
git add next.config.mjs
git commit -m "feat: configure TMDB image domain in Next.js"
```

---

### Task 6: Hooks — useDebounce and useLocalStorage

**Files:**
- Create: `hooks/useDebounce.ts`
- Create: `hooks/useLocalStorage.ts`
- Test: `__tests__/hooks/useDebounce.test.ts`
- Test: `__tests__/hooks/useLocalStorage.test.ts`

**Step 1: Write the failing useDebounce test**

Create `__tests__/hooks/useDebounce.test.ts`:
```typescript
import { renderHook, act } from '@testing-library/react'
import { useDebounce } from '@/hooks/useDebounce'

jest.useFakeTimers()

describe('useDebounce', () => {
  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('hello', 300))
    expect(result.current).toBe('hello')
  })

  it('does not update before delay', () => {
    const { result, rerender } = renderHook(({ val }) => useDebounce(val, 300), {
      initialProps: { val: 'hello' },
    })
    rerender({ val: 'world' })
    expect(result.current).toBe('hello')
  })

  it('updates after delay', () => {
    const { result, rerender } = renderHook(({ val }) => useDebounce(val, 300), {
      initialProps: { val: 'hello' },
    })
    rerender({ val: 'world' })
    act(() => jest.advanceTimersByTime(300))
    expect(result.current).toBe('world')
  })
})
```

**Step 2: Write the failing useLocalStorage test**

Create `__tests__/hooks/useLocalStorage.test.ts`:
```typescript
import { renderHook, act } from '@testing-library/react'
import { useLocalStorage } from '@/hooks/useLocalStorage'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value },
    clear: () => { store = {} },
  }
})()
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

beforeEach(() => localStorageMock.clear())

describe('useLocalStorage', () => {
  it('returns initial value before hydration', () => {
    const { result } = renderHook(() => useLocalStorage('test_key', 'initial'))
    expect(result.current[0]).toBe('initial')
  })

  it('reads from localStorage after hydration', async () => {
    localStorageMock.setItem('test_key', JSON.stringify('stored_value'))
    const { result } = renderHook(() => useLocalStorage('test_key', 'initial'))
    // Wait for useEffect to run
    await act(async () => {})
    expect(result.current[0]).toBe('stored_value')
  })

  it('updates localStorage when value changes', async () => {
    const { result } = renderHook(() => useLocalStorage<string>('test_key', 'initial'))
    await act(async () => {})
    act(() => result.current[1]('new_value'))
    await act(async () => {})
    expect(localStorageMock.getItem('test_key')).toBe(JSON.stringify('new_value'))
  })
})
```

**Step 3: Run tests to verify they fail**

```bash
npm test -- __tests__/hooks/
```
Expected: FAIL — "Cannot find module"

**Step 4: Create `hooks/useDebounce.ts`**

```typescript
import { useState, useEffect } from 'react'

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}
```

**Step 5: Create `hooks/useLocalStorage.ts`**

```typescript
'use client'
import { useState, useEffect } from 'react'

export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(key)
    if (stored) {
      try { setValue(JSON.parse(stored)) } catch {}
    }
    setHydrated(true)
  }, [key])

  useEffect(() => {
    if (hydrated) localStorage.setItem(key, JSON.stringify(value))
  }, [key, value, hydrated])

  return [value, setValue, hydrated] as const
}
```

**Step 6: Run tests to verify they pass**

```bash
npm test -- __tests__/hooks/
```
Expected: PASS

**Step 7: Commit**

```bash
git add hooks/ __tests__/hooks/
git commit -m "feat: add useDebounce and useLocalStorage hooks"
```

---

## Phase 2 — Layout, Homepage & Core Components

### Task 7: WatchlistContext

**Files:**
- Create: `context/WatchlistContext.tsx`
- Test: `__tests__/context/WatchlistContext.test.tsx`

**Step 1: Write the failing test**

Create `__tests__/context/WatchlistContext.test.tsx`:
```typescript
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { WatchlistProvider, useWatchlist } from '@/context/WatchlistContext'
import type { WatchlistItem } from '@/lib/types'

const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value },
    clear: () => { store = {} },
  }
})()
Object.defineProperty(window, 'localStorage', { value: localStorageMock })
beforeEach(() => localStorageMock.clear())

const testItem: WatchlistItem = {
  id: 1, type: 'movie', title: 'Test Movie',
  poster_path: null, vote_average: 7.5, addedAt: new Date().toISOString(),
}

function TestComponent() {
  const { watchlist, addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist()
  return (
    <div>
      <span data-testid="count">{watchlist.length}</span>
      <span data-testid="inList">{isInWatchlist(1) ? 'yes' : 'no'}</span>
      <button onClick={() => addToWatchlist(testItem)}>Add</button>
      <button onClick={() => removeFromWatchlist(1)}>Remove</button>
    </div>
  )
}

describe('WatchlistContext', () => {
  it('starts with empty watchlist', async () => {
    render(<WatchlistProvider><TestComponent /></WatchlistProvider>)
    await act(async () => {})
    expect(screen.getByTestId('count').textContent).toBe('0')
  })

  it('adds item to watchlist', async () => {
    const user = userEvent.setup()
    render(<WatchlistProvider><TestComponent /></WatchlistProvider>)
    await act(async () => {})
    await user.click(screen.getByText('Add'))
    expect(screen.getByTestId('count').textContent).toBe('1')
    expect(screen.getByTestId('inList').textContent).toBe('yes')
  })

  it('removes item from watchlist', async () => {
    const user = userEvent.setup()
    render(<WatchlistProvider><TestComponent /></WatchlistProvider>)
    await act(async () => {})
    await user.click(screen.getByText('Add'))
    await user.click(screen.getByText('Remove'))
    expect(screen.getByTestId('count').textContent).toBe('0')
    expect(screen.getByTestId('inList').textContent).toBe('no')
  })
})
```

**Step 2: Run test to verify it fails**

```bash
npm test -- __tests__/context/WatchlistContext.test.tsx
```
Expected: FAIL

**Step 3: Create `context/WatchlistContext.tsx`**

```typescript
'use client'
import { createContext, useContext } from 'react'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import type { WatchlistItem, HistoryItem } from '@/lib/types'

interface WatchlistContextType {
  watchlist: WatchlistItem[]
  history: HistoryItem[]
  addToWatchlist: (item: WatchlistItem) => void
  removeFromWatchlist: (id: number) => void
  isInWatchlist: (id: number) => boolean
  addToHistory: (item: HistoryItem) => void
  clearHistory: () => void
}

const WatchlistContext = createContext<WatchlistContextType | null>(null)

export function WatchlistProvider({ children }: { children: React.ReactNode }) {
  const [watchlist, setWatchlist] = useLocalStorage<WatchlistItem[]>('cinestream_watchlist', [])
  const [history, setHistory] = useLocalStorage<HistoryItem[]>('cinestream_history', [])

  function addToWatchlist(item: WatchlistItem) {
    setWatchlist((prev) => {
      if (prev.some((i) => i.id === item.id && i.type === item.type)) return prev
      return [item, ...prev]
    })
  }

  function removeFromWatchlist(id: number) {
    setWatchlist((prev) => prev.filter((i) => i.id !== id))
  }

  function isInWatchlist(id: number) {
    return watchlist.some((i) => i.id === id)
  }

  function addToHistory(item: HistoryItem) {
    setHistory((prev) => {
      const filtered = prev.filter((i) => !(i.id === item.id && i.type === item.type))
      return [item, ...filtered].slice(0, 50)
    })
  }

  function clearHistory() {
    setHistory([])
  }

  return (
    <WatchlistContext.Provider value={{
      watchlist, history,
      addToWatchlist, removeFromWatchlist, isInWatchlist,
      addToHistory, clearHistory,
    }}>
      {children}
    </WatchlistContext.Provider>
  )
}

export function useWatchlist() {
  const ctx = useContext(WatchlistContext)
  if (!ctx) throw new Error('useWatchlist must be used inside WatchlistProvider')
  return ctx
}
```

**Step 4: Run test to verify it passes**

```bash
npm test -- __tests__/context/WatchlistContext.test.tsx
```
Expected: PASS

**Step 5: Commit**

```bash
git add context/ __tests__/context/
git commit -m "feat: add WatchlistContext with localStorage persistence"
```

---

### Task 8: Root Layout & Global Styles

**Files:**
- Modify: `app/layout.tsx`
- Modify: `app/globals.css`

**Step 1: Update `app/globals.css`**

Replace content with:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: #141414;
  --foreground: #ffffff;
}

body {
  background-color: #141414;
  color: #ffffff;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

/* Custom thin scrollbar */
::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}
::-webkit-scrollbar-track {
  background: #1a1a1a;
}
::-webkit-scrollbar-thumb {
  background: #444;
  border-radius: 2px;
}
::-webkit-scrollbar-thumb:hover {
  background: #666;
}

/* Hide scrollbar for carousels but keep functionality */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
```

**Step 2: Update `app/layout.tsx`**

```typescript
import type { Metadata } from 'next'
import './globals.css'
import { WatchlistProvider } from '@/context/WatchlistContext'
import { Navbar } from '@/components/Navbar'

export const metadata: Metadata = {
  title: 'CineStream',
  description: 'Your local streaming experience',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#141414] text-white min-h-screen">
        <WatchlistProvider>
          <Navbar />
          <main>{children}</main>
        </WatchlistProvider>
      </body>
    </html>
  )
}
```

**Step 3: Create a placeholder `components/Navbar.tsx`** (full version in Task 9)

```typescript
export function Navbar() {
  return <nav className="h-16 bg-black/80" />
}
```

**Step 4: Run build to check for errors**

```bash
npm run build
```
Expected: Build succeeds (or only warns about missing pages — that's OK)

**Step 5: Commit**

```bash
git add app/layout.tsx app/globals.css components/Navbar.tsx
git commit -m "feat: add root layout with WatchlistProvider and dark theme"
```

---

### Task 9: Navbar Component

**Files:**
- Modify: `components/Navbar.tsx`
- Test: `__tests__/components/Navbar.test.tsx`

**Step 1: Write the failing test**

Create `__tests__/components/Navbar.test.tsx`:
```typescript
import { render, screen } from '@testing-library/react'
import { Navbar } from '@/components/Navbar'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => '/',
}))

// Mock WatchlistContext
jest.mock('@/context/WatchlistContext', () => ({
  useWatchlist: () => ({ watchlist: [] }),
}))

describe('Navbar', () => {
  it('renders logo text', () => {
    render(<Navbar />)
    expect(screen.getByText('CineStream')).toBeInTheDocument()
  })

  it('renders navigation links', () => {
    render(<Navbar />)
    expect(screen.getByText('Movies')).toBeInTheDocument()
    expect(screen.getByText('TV Shows')).toBeInTheDocument()
  })

  it('renders watchlist link', () => {
    render(<Navbar />)
    expect(screen.getByRole('link', { name: /watchlist/i })).toBeInTheDocument()
  })
})
```

**Step 2: Run test to verify it fails**

```bash
npm test -- __tests__/components/Navbar.test.tsx
```
Expected: FAIL

**Step 3: Replace `components/Navbar.tsx`**

```typescript
'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Search, Bookmark, Film } from 'lucide-react'
import { useWatchlist } from '@/context/WatchlistContext'
import { useDebounce } from '@/hooks/useDebounce'

export function Navbar() {
  const router = useRouter()
  const { watchlist } = useWatchlist()
  const [query, setQuery] = useState('')
  const debounced = useDebounce(query, 300)

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (query.trim()) router.push(`/search?q=${encodeURIComponent(query.trim())}`)
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-gradient-to-b from-black/90 to-transparent backdrop-blur-sm flex items-center px-6 gap-6">
      <Link href="/" className="flex items-center gap-2 text-red-600 font-bold text-xl shrink-0">
        <Film size={24} />
        CineStream
      </Link>

      <div className="flex items-center gap-4 text-sm font-medium">
        <Link href="/browse/movies" className="text-zinc-300 hover:text-white transition-colors">
          Movies
        </Link>
        <Link href="/browse/tv" className="text-zinc-300 hover:text-white transition-colors">
          TV Shows
        </Link>
      </div>

      <div className="flex-1" />

      <form onSubmit={handleSearch} className="flex items-center">
        <div className="flex items-center bg-zinc-900/80 border border-zinc-700 rounded-md px-3 py-1.5 gap-2 focus-within:border-zinc-500 transition-colors">
          <Search size={16} className="text-zinc-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search movies & TV..."
            className="bg-transparent text-sm text-white placeholder-zinc-500 outline-none w-48"
          />
        </div>
      </form>

      <Link
        href="/watchlist"
        aria-label="Watchlist"
        className="relative flex items-center gap-1.5 text-zinc-300 hover:text-white transition-colors"
      >
        <Bookmark size={20} />
        <span className="text-sm">Watchlist</span>
        {watchlist.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
            {watchlist.length > 9 ? '9+' : watchlist.length}
          </span>
        )}
      </Link>
    </nav>
  )
}
```

**Step 4: Run test to verify it passes**

```bash
npm test -- __tests__/components/Navbar.test.tsx
```
Expected: PASS

**Step 5: Commit**

```bash
git add components/Navbar.tsx __tests__/components/Navbar.test.tsx
git commit -m "feat: add Navbar with search and watchlist link"
```

---

### Task 10: RatingBadge & SkeletonCard Components

**Files:**
- Create: `components/RatingBadge.tsx`
- Create: `components/SkeletonCard.tsx`
- Test: `__tests__/components/RatingBadge.test.tsx`

**Step 1: Write the failing test**

Create `__tests__/components/RatingBadge.test.tsx`:
```typescript
import { render, screen } from '@testing-library/react'
import { RatingBadge } from '@/components/RatingBadge'

describe('RatingBadge', () => {
  it('shows green for rating >= 7.0', () => {
    const { container } = render(<RatingBadge rating={8.5} />)
    expect(container.firstChild).toHaveClass('bg-green-500')
    expect(screen.getByText('8.5')).toBeInTheDocument()
  })

  it('shows yellow for rating >= 5.0 and < 7.0', () => {
    const { container } = render(<RatingBadge rating={6.0} />)
    expect(container.firstChild).toHaveClass('bg-yellow-500')
  })

  it('shows red for rating < 5.0', () => {
    const { container } = render(<RatingBadge rating={4.9} />)
    expect(container.firstChild).toHaveClass('bg-red-500')
  })

  it('formats rating to one decimal', () => {
    render(<RatingBadge rating={7} />)
    expect(screen.getByText('7.0')).toBeInTheDocument()
  })
})
```

**Step 2: Run test to verify it fails**

```bash
npm test -- __tests__/components/RatingBadge.test.tsx
```
Expected: FAIL

**Step 3: Create `components/RatingBadge.tsx`**

```typescript
interface RatingBadgeProps {
  rating: number
  className?: string
}

export function RatingBadge({ rating, className = '' }: RatingBadgeProps) {
  const color =
    rating >= 7.0 ? 'bg-green-500 text-black' :
    rating >= 5.0 ? 'bg-yellow-500 text-black' :
    'bg-red-500 text-white'

  return (
    <span className={`${color} text-xs font-bold px-1.5 py-0.5 rounded ${className}`}>
      {rating.toFixed(1)}
    </span>
  )
}
```

**Step 4: Create `components/SkeletonCard.tsx`** (no test needed — pure visual)

```typescript
export function SkeletonCard() {
  return (
    <div className="shrink-0 w-36 md:w-44 animate-pulse">
      <div className="aspect-[2/3] bg-zinc-800 rounded-lg mb-2" />
      <div className="h-3 bg-zinc-800 rounded w-3/4" />
    </div>
  )
}
```

**Step 5: Run test to verify it passes**

```bash
npm test -- __tests__/components/RatingBadge.test.tsx
```
Expected: PASS

**Step 6: Commit**

```bash
git add components/RatingBadge.tsx components/SkeletonCard.tsx __tests__/components/RatingBadge.test.tsx
git commit -m "feat: add RatingBadge and SkeletonCard components"
```

---

### Task 11: MediaCard Component

**Files:**
- Create: `components/MediaCard.tsx`
- Test: `__tests__/components/MediaCard.test.tsx`

**Step 1: Write the failing test**

Create `__tests__/components/MediaCard.test.tsx`:
```typescript
import { render, screen } from '@testing-library/react'
import { MediaCard } from '@/components/MediaCard'
import type { Movie } from '@/lib/types'

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: { alt: string; src: string }) => <img alt={props.alt} src={props.src} />,
}))

const mockMovie: Movie = {
  id: 1, title: 'Test Movie', overview: 'A great movie.',
  poster_path: '/poster.jpg', backdrop_path: null,
  vote_average: 8.0, release_date: '2024-01-01',
  genre_ids: [28], media_type: 'movie',
}

describe('MediaCard', () => {
  it('renders movie title', () => {
    render(<MediaCard item={mockMovie} />)
    expect(screen.getByText('Test Movie')).toBeInTheDocument()
  })

  it('links to correct movie detail page', () => {
    render(<MediaCard item={mockMovie} />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/movie/1')
  })

  it('renders rating badge', () => {
    render(<MediaCard item={mockMovie} />)
    expect(screen.getByText('8.0')).toBeInTheDocument()
  })
})
```

**Step 2: Run test to verify it fails**

```bash
npm test -- __tests__/components/MediaCard.test.tsx
```
Expected: FAIL

**Step 3: Create `components/MediaCard.tsx`**

```typescript
import Link from 'next/link'
import Image from 'next/image'
import type { MediaItem } from '@/lib/types'
import { posterURL } from '@/lib/constants'
import { RatingBadge } from './RatingBadge'

interface MediaCardProps {
  item: MediaItem
}

export function MediaCard({ item }: MediaCardProps) {
  const isMovie = item.media_type === 'movie'
  const title = isMovie ? (item as any).title : (item as any).name
  const href = `/${isMovie ? 'movie' : 'tv'}/${item.id}`

  return (
    <Link href={href} className="group shrink-0 w-36 md:w-44 block">
      <div className="relative aspect-[2/3] bg-zinc-800 rounded-lg overflow-hidden mb-2">
        <Image
          src={posterURL(item.poster_path)}
          alt={title}
          fill
          loading="lazy"
          className="object-cover group-hover:scale-105 transition-transform duration-200"
          sizes="(max-width: 768px) 144px, 176px"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <RatingBadge rating={item.vote_average} />
        </div>
      </div>
      <p className="text-sm text-zinc-300 truncate font-medium">{title}</p>
      <RatingBadge rating={item.vote_average} className="mt-1" />
    </Link>
  )
}
```

**Step 4: Run test to verify it passes**

```bash
npm test -- __tests__/components/MediaCard.test.tsx
```
Expected: PASS

**Step 5: Commit**

```bash
git add components/MediaCard.tsx __tests__/components/MediaCard.test.tsx
git commit -m "feat: add MediaCard component with hover effects"
```

---

### Task 12: ContentCarousel Component

**Files:**
- Create: `components/ContentCarousel.tsx`
- Test: `__tests__/components/ContentCarousel.test.tsx`

**Step 1: Write the failing test**

Create `__tests__/components/ContentCarousel.test.tsx`:
```typescript
import { render, screen } from '@testing-library/react'
import { ContentCarousel } from '@/components/ContentCarousel'
import type { Movie } from '@/lib/types'

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: { alt: string }) => <img alt={props.alt} />,
}))

const mockItems: Movie[] = [
  { id: 1, title: 'Movie 1', overview: '', poster_path: null, backdrop_path: null, vote_average: 7, release_date: '', genre_ids: [], media_type: 'movie' },
  { id: 2, title: 'Movie 2', overview: '', poster_path: null, backdrop_path: null, vote_average: 8, release_date: '', genre_ids: [], media_type: 'movie' },
]

describe('ContentCarousel', () => {
  it('renders the title', () => {
    render(<ContentCarousel title="Trending" items={mockItems} />)
    expect(screen.getByText('Trending')).toBeInTheDocument()
  })

  it('renders all items', () => {
    render(<ContentCarousel title="Trending" items={mockItems} />)
    expect(screen.getByText('Movie 1')).toBeInTheDocument()
    expect(screen.getByText('Movie 2')).toBeInTheDocument()
  })

  it('renders skeleton cards when loading', () => {
    render(<ContentCarousel title="Trending" items={[]} loading />)
    expect(document.querySelectorAll('.animate-pulse')).toHaveLength(6)
  })
})
```

**Step 2: Run test to verify it fails**

```bash
npm test -- __tests__/components/ContentCarousel.test.tsx
```
Expected: FAIL

**Step 3: Create `components/ContentCarousel.tsx`**

```typescript
'use client'
import { useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { MediaItem } from '@/lib/types'
import { MediaCard } from './MediaCard'
import { SkeletonCard } from './SkeletonCard'

interface ContentCarouselProps {
  title: string
  items: MediaItem[]
  loading?: boolean
}

export function ContentCarousel({ title, items, loading = false }: ContentCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  function scroll(dir: 'left' | 'right') {
    if (!scrollRef.current) return
    const amount = scrollRef.current.clientWidth * 0.75
    scrollRef.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' })
  }

  return (
    <section className="mb-8">
      <h2 className="text-lg font-bold text-white mb-3 px-6">{title}</h2>
      <div className="relative group/carousel">
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-0 bottom-0 z-10 w-12 bg-gradient-to-r from-black/70 to-transparent flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity"
          aria-label="Scroll left"
        >
          <ChevronLeft className="text-white" size={28} />
        </button>

        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto no-scrollbar px-6 scroll-smooth"
        >
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
            : items.map((item) => <MediaCard key={item.id} item={item} />)
          }
        </div>

        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-0 bottom-0 z-10 w-12 bg-gradient-to-l from-black/70 to-transparent flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity"
          aria-label="Scroll right"
        >
          <ChevronRight className="text-white" size={28} />
        </button>
      </div>
    </section>
  )
}
```

**Step 4: Run test to verify it passes**

```bash
npm test -- __tests__/components/ContentCarousel.test.tsx
```
Expected: PASS

**Step 5: Commit**

```bash
git add components/ContentCarousel.tsx __tests__/components/ContentCarousel.test.tsx
git commit -m "feat: add ContentCarousel with scroll buttons and skeleton loading"
```

---

### Task 13: HeroBanner Component

**Files:**
- Create: `components/HeroBanner.tsx`

**Step 1: Create `components/HeroBanner.tsx`**

(No unit test — heavy on animations and browser APIs; test visually)

```typescript
'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Info } from 'lucide-react'
import type { MediaItem } from '@/lib/types'
import { backdropURL } from '@/lib/constants'
import { RatingBadge } from './RatingBadge'

interface HeroBannerProps {
  items: MediaItem[]
}

export function HeroBanner({ items }: HeroBannerProps) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (items.length <= 1) return
    const timer = setInterval(() => setIndex((i) => (i + 1) % items.length), 8000)
    return () => clearInterval(timer)
  }, [items.length])

  if (!items.length) return <div className="h-[60vh] bg-zinc-900 animate-pulse" />

  const item = items[index]
  const isMovie = item.media_type === 'movie'
  const title = isMovie ? (item as any).title : (item as any).name
  const watchHref = `/${isMovie ? 'watch/movie' : 'watch/tv'}/${item.id}`
  const detailHref = `/${isMovie ? 'movie' : 'tv'}/${item.id}`

  return (
    <div className="relative h-[70vh] min-h-[500px] overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={item.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
        >
          <Image
            src={backdropURL(item.backdrop_path)}
            alt={title}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 flex flex-col justify-end h-full pb-16 px-6 md:px-12 max-w-2xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5 }}
          >
            <RatingBadge rating={item.vote_average} className="mb-3" />
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">{title}</h1>
            <p className="text-zinc-300 text-sm md:text-base line-clamp-3 mb-6">
              {item.overview}
            </p>
            <div className="flex gap-3">
              <Link
                href={watchHref}
                className="flex items-center gap-2 bg-white text-black font-bold px-6 py-2.5 rounded-md hover:bg-zinc-200 transition-colors"
              >
                <Play size={18} fill="black" /> Watch Now
              </Link>
              <Link
                href={detailHref}
                className="flex items-center gap-2 bg-zinc-700/80 text-white font-semibold px-6 py-2.5 rounded-md hover:bg-zinc-600 transition-colors"
              >
                <Info size={18} /> More Info
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Dot indicators */}
        <div className="flex gap-1.5 mt-6">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`h-1 rounded-full transition-all duration-300 ${i === index ? 'w-6 bg-white' : 'w-2 bg-zinc-600'}`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add components/HeroBanner.tsx
git commit -m "feat: add HeroBanner with auto-rotation and Framer Motion transitions"
```

---

### Task 14: Homepage

**Files:**
- Modify: `app/page.tsx`

**Step 1: Replace `app/page.tsx`**

```typescript
import { getTrending, getPopular, getTopRated, getNowPlaying, getOnTheAir } from '@/lib/tmdb'
import { HeroBanner } from '@/components/HeroBanner'
import { ContentCarousel } from '@/components/ContentCarousel'
import type { MediaItem } from '@/lib/types'

export const revalidate = 3600 // re-fetch at most every hour

export default async function HomePage() {
  const [
    trending,
    popularMovies,
    popularTV,
    topRated,
    nowPlaying,
    onAir,
  ] = await Promise.all([
    getTrending('movie', 'day'),
    getPopular('movie'),
    getPopular('tv'),
    getTopRated('movie'),
    getNowPlaying(),
    getOnTheAir(),
  ])

  // Tag results with media_type (TMDB trending adds it, others don't)
  const tagMovie = (r: any): MediaItem => ({ ...r, media_type: 'movie' as const })
  const tagTV = (r: any): MediaItem => ({ ...r, media_type: 'tv' as const })

  const heroItems: MediaItem[] = trending.results.slice(0, 8)
    .map((item: any) => item.media_type ? item : tagMovie(item))

  return (
    <div className="pt-16"> {/* offset for fixed navbar */}
      <HeroBanner items={heroItems} />
      <div className="py-8">
        <ContentCarousel title="Trending Today" items={trending.results.slice(0, 20).map((i: any) => i.media_type ? i : tagMovie(i))} />
        <ContentCarousel title="Popular Movies" items={popularMovies.results.map(tagMovie)} />
        <ContentCarousel title="Popular TV Shows" items={popularTV.results.map(tagTV)} />
        <ContentCarousel title="Top Rated Movies" items={topRated.results.map(tagMovie)} />
        <ContentCarousel title="Now Playing in Theaters" items={nowPlaying.results.map(tagMovie)} />
        <ContentCarousel title="Currently Airing TV" items={onAir.results.map(tagTV)} />
      </div>
    </div>
  )
}
```

**Step 2: Verify the dev server works**

```bash
npm run dev
```

Open http://localhost:3000. You should see the hero banner and carousels. Stop with Ctrl+C.

**Step 3: Run all tests**

```bash
npm test
```
Expected: All PASS

**Step 4: Commit**

```bash
git add app/page.tsx
git commit -m "feat: build homepage with hero banner and 6 content carousels"
```

---

## Phase 3 — Detail Pages

### Task 15: CastRow Component

**Files:**
- Create: `components/CastRow.tsx`

```typescript
import Image from 'next/image'
import type { Cast } from '@/lib/types'
import { posterURL } from '@/lib/constants'

export function CastRow({ cast }: { cast: Cast[] }) {
  if (!cast.length) return null
  return (
    <div>
      <h3 className="text-lg font-bold text-white mb-3">Cast</h3>
      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
        {cast.slice(0, 15).map((member) => (
          <div key={member.id} className="shrink-0 w-24 text-center">
            <div className="relative w-24 h-24 rounded-full overflow-hidden bg-zinc-800 mb-2">
              <Image
                src={posterURL(member.profile_path, 'w200')}
                alt={member.name}
                fill
                loading="lazy"
                className="object-cover"
                sizes="96px"
              />
            </div>
            <p className="text-sm font-medium text-white truncate">{member.name}</p>
            <p className="text-xs text-zinc-400 truncate">{member.character}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
```

**Commit:**
```bash
git add components/CastRow.tsx
git commit -m "feat: add CastRow component"
```

---

### Task 16: TrailerModal Component

**Files:**
- Create: `components/TrailerModal.tsx`

```typescript
'use client'
import { useEffect } from 'react'
import { X } from 'lucide-react'

interface TrailerModalProps {
  videoKey: string
  onClose: () => void
}

export function TrailerModal({ videoKey, onClose }: TrailerModalProps) {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl aspect-video"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white hover:text-zinc-300 transition-colors"
          aria-label="Close trailer"
        >
          <X size={28} />
        </button>
        <iframe
          src={`https://www.youtube.com/embed/${videoKey}?autoplay=1`}
          title="Trailer"
          className="w-full h-full rounded-lg"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  )
}
```

**Commit:**
```bash
git add components/TrailerModal.tsx
git commit -m "feat: add TrailerModal with YouTube embed"
```

---

### Task 17: Movie Detail Page

**Files:**
- Create: `app/movie/[id]/page.tsx`

**Step 1: Create `app/movie/[id]/page.tsx`**

```typescript
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getDetails, getCredits, getSimilar, getVideos } from '@/lib/tmdb'
import { backdropURL, posterURL } from '@/lib/constants'
import { RatingBadge } from '@/components/RatingBadge'
import { CastRow } from '@/components/CastRow'
import { ContentCarousel } from '@/components/ContentCarousel'
import type { Movie, MediaItem } from '@/lib/types'
import { MovieDetailClient } from './MovieDetailClient'

interface Props { params: { id: string } }

export async function generateMetadata({ params }: Props) {
  const movie = await getDetails('movie', Number(params.id)).catch(() => null) as Movie | null
  return { title: movie ? `${movie.title} — CineStream` : 'Movie — CineStream' }
}

export default async function MovieDetailPage({ params }: Props) {
  const id = Number(params.id)
  if (isNaN(id)) notFound()

  const [movie, credits, similar, videos] = await Promise.all([
    getDetails('movie', id).catch(() => null),
    getCredits('movie', id).catch(() => ({ cast: [] })),
    getSimilar('movie', id).catch(() => ({ results: [] })),
    getVideos('movie', id).catch(() => ({ results: [] })),
  ])

  if (!movie) notFound()
  const m = movie as Movie
  const trailer = videos.results.find((v) => v.site === 'YouTube' && v.type === 'Trailer')
  const similarItems: MediaItem[] = similar.results.slice(0, 20).map((i: any) => ({ ...i, media_type: 'movie' as const }))

  return (
    <div className="pt-16 min-h-screen">
      {/* Backdrop */}
      <div className="relative h-[50vh] min-h-[360px]">
        <Image
          src={backdropURL(m.backdrop_path)}
          alt={m.title}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-black/40 to-transparent" />
      </div>

      {/* Detail content */}
      <div className="px-6 md:px-12 -mt-32 relative z-10">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster */}
          <div className="shrink-0">
            <div className="relative w-48 h-72 md:w-56 md:h-84 rounded-lg overflow-hidden shadow-2xl">
              <Image
                src={posterURL(m.poster_path, 'w342')}
                alt={m.title}
                fill
                className="object-cover"
                sizes="224px"
              />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 pt-8 md:pt-32">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-1">{m.title}</h1>
            {m.tagline && <p className="text-zinc-400 italic mb-3">{m.tagline}</p>}
            <div className="flex items-center flex-wrap gap-3 mb-4">
              <RatingBadge rating={m.vote_average} />
              {m.release_date && <span className="text-zinc-400 text-sm">{m.release_date.slice(0, 4)}</span>}
              {m.runtime && <span className="text-zinc-400 text-sm">{Math.floor(m.runtime / 60)}h {m.runtime % 60}m</span>}
              {m.genres?.map((g) => (
                <span key={g.id} className="text-xs border border-zinc-600 text-zinc-300 px-2 py-0.5 rounded-full">
                  {g.name}
                </span>
              ))}
            </div>
            <p className="text-zinc-300 text-sm leading-relaxed mb-6 max-w-2xl">{m.overview}</p>
            <MovieDetailClient
              movieId={id}
              movieTitle={m.title}
              posterPath={m.poster_path}
              voteAverage={m.vote_average}
              trailerKey={trailer?.key ?? null}
            />
          </div>
        </div>

        {credits.cast.length > 0 && (
          <div className="mt-12">
            <CastRow cast={credits.cast} />
          </div>
        )}

        {similarItems.length > 0 && (
          <div className="mt-12 -mx-6 md:-mx-12">
            <ContentCarousel title="Similar Movies" items={similarItems} />
          </div>
        )}
      </div>
    </div>
  )
}
```

**Step 2: Create `app/movie/[id]/MovieDetailClient.tsx`**

```typescript
'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Play, Heart, Youtube } from 'lucide-react'
import { useWatchlist } from '@/context/WatchlistContext'
import { TrailerModal } from '@/components/TrailerModal'

interface Props {
  movieId: number
  movieTitle: string
  posterPath: string | null
  voteAverage: number
  trailerKey: string | null
}

export function MovieDetailClient({ movieId, movieTitle, posterPath, voteAverage, trailerKey }: Props) {
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist()
  const [showTrailer, setShowTrailer] = useState(false)
  const inList = isInWatchlist(movieId)

  function toggleWatchlist() {
    if (inList) {
      removeFromWatchlist(movieId)
    } else {
      addToWatchlist({
        id: movieId, type: 'movie', title: movieTitle,
        poster_path: posterPath, vote_average: voteAverage,
        addedAt: new Date().toISOString(),
      })
    }
  }

  return (
    <>
      <div className="flex flex-wrap gap-3">
        <Link
          href={`/watch/movie/${movieId}`}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2.5 rounded-md transition-colors"
        >
          <Play size={18} fill="white" /> Watch Now
        </Link>
        <button
          onClick={toggleWatchlist}
          className={`flex items-center gap-2 border font-semibold px-6 py-2.5 rounded-md transition-colors ${
            inList
              ? 'border-red-600 text-red-600 hover:bg-red-600/10'
              : 'border-zinc-600 text-zinc-300 hover:border-zinc-400 hover:text-white'
          }`}
          aria-label={inList ? 'Remove from watchlist' : 'Add to watchlist'}
        >
          <Heart size={18} fill={inList ? 'currentColor' : 'none'} />
          {inList ? 'In Watchlist' : 'Add to Watchlist'}
        </button>
        {trailerKey && (
          <button
            onClick={() => setShowTrailer(true)}
            className="flex items-center gap-2 border border-zinc-600 text-zinc-300 hover:text-white hover:border-zinc-400 font-semibold px-6 py-2.5 rounded-md transition-colors"
          >
            <Youtube size={18} /> Trailer
          </button>
        )}
      </div>
      {showTrailer && trailerKey && (
        <TrailerModal videoKey={trailerKey} onClose={() => setShowTrailer(false)} />
      )}
    </>
  )
}
```

**Step 3: Run build to check**

```bash
npm run build
```
Expected: No TypeScript errors

**Step 4: Commit**

```bash
git add app/movie/
git commit -m "feat: add movie detail page with cast, trailer, and watchlist"
```

---

### Task 18: SeasonPicker Component & TV Detail Page

**Files:**
- Create: `components/SeasonPicker.tsx`
- Create: `app/tv/[id]/page.tsx`
- Create: `app/tv/[id]/TVDetailClient.tsx`

**Step 1: Create `components/SeasonPicker.tsx`**

```typescript
'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'
import type { Season, Episode } from '@/lib/types'
import { getSeasonDetails } from '@/lib/tmdb'
import { posterURL } from '@/lib/constants'

interface SeasonPickerProps {
  tvId: number
  seasons: Season[]
}

export function SeasonPicker({ tvId, seasons }: SeasonPickerProps) {
  const regularSeasons = seasons.filter((s) => s.season_number > 0)
  const [selected, setSelected] = useState(regularSeasons[0]?.season_number ?? 1)
  const [episodes, setEpisodes] = useState<Episode[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    getSeasonDetails(tvId, selected)
      .then((data) => setEpisodes(data.episodes ?? []))
      .catch(() => setEpisodes([]))
      .finally(() => setLoading(false))
  }, [tvId, selected])

  return (
    <div>
      {/* Season dropdown */}
      <div className="relative inline-block mb-4">
        <select
          value={selected}
          onChange={(e) => setSelected(Number(e.target.value))}
          className="appearance-none bg-zinc-800 text-white border border-zinc-700 rounded-md px-4 py-2 pr-10 text-sm focus:outline-none focus:border-zinc-500 cursor-pointer"
        >
          {regularSeasons.map((s) => (
            <option key={s.season_number} value={s.season_number}>
              {s.name || `Season ${s.season_number}`}
            </option>
          ))}
        </select>
        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
      </div>

      {/* Episode list */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-24 bg-zinc-800 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {episodes.map((ep) => (
            <Link
              key={ep.id}
              href={`/watch/tv/${tvId}?s=${selected}&e=${ep.episode_number}`}
              className="flex gap-3 p-3 bg-zinc-900 hover:bg-zinc-800 rounded-lg transition-colors group"
            >
              <div className="relative shrink-0 w-36 h-20 bg-zinc-800 rounded overflow-hidden">
                <Image
                  src={posterURL(ep.still_path, 'w200')}
                  alt={ep.name}
                  fill
                  loading="lazy"
                  className="object-cover group-hover:scale-105 transition-transform duration-200"
                  sizes="144px"
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-white/20 rounded-full p-2">▶</div>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white mb-1">
                  {ep.episode_number}. {ep.name}
                </p>
                <p className="text-xs text-zinc-400 line-clamp-2">{ep.overview}</p>
                {ep.air_date && <p className="text-xs text-zinc-500 mt-1">{ep.air_date}</p>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
```

**Step 2: Create `app/tv/[id]/page.tsx`**

```typescript
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getDetails, getCredits, getSimilar, getVideos } from '@/lib/tmdb'
import { backdropURL, posterURL } from '@/lib/constants'
import { RatingBadge } from '@/components/RatingBadge'
import { CastRow } from '@/components/CastRow'
import { SeasonPicker } from '@/components/SeasonPicker'
import { ContentCarousel } from '@/components/ContentCarousel'
import type { TVShow, Season, MediaItem } from '@/lib/types'
import { TVDetailClient } from './TVDetailClient'

interface Props { params: { id: string } }

export async function generateMetadata({ params }: Props) {
  const show = await getDetails('tv', Number(params.id)).catch(() => null) as TVShow | null
  return { title: show ? `${show.name} — CineStream` : 'TV Show — CineStream' }
}

export default async function TVDetailPage({ params }: Props) {
  const id = Number(params.id)
  if (isNaN(id)) notFound()

  const [show, credits, similar, videos] = await Promise.all([
    getDetails('tv', id).catch(() => null),
    getCredits('tv', id).catch(() => ({ cast: [] })),
    getSimilar('tv', id).catch(() => ({ results: [] })),
    getVideos('tv', id).catch(() => ({ results: [] })),
  ])

  if (!show) notFound()
  const s = show as TVShow & { seasons?: Season[] }
  const trailer = videos.results.find((v) => v.site === 'YouTube' && v.type === 'Trailer')
  const similarItems: MediaItem[] = similar.results.slice(0, 20).map((i: any) => ({ ...i, media_type: 'tv' as const }))

  return (
    <div className="pt-16 min-h-screen">
      <div className="relative h-[50vh] min-h-[360px]">
        <Image src={backdropURL(s.backdrop_path)} alt={s.name} fill priority className="object-cover" sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-black/40 to-transparent" />
      </div>

      <div className="px-6 md:px-12 -mt-32 relative z-10">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="shrink-0">
            <div className="relative w-48 h-72 md:w-56 md:h-84 rounded-lg overflow-hidden shadow-2xl">
              <Image src={posterURL(s.poster_path, 'w342')} alt={s.name} fill className="object-cover" sizes="224px" />
            </div>
          </div>
          <div className="flex-1 pt-8 md:pt-32">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-1">{s.name}</h1>
            {s.tagline && <p className="text-zinc-400 italic mb-3">{s.tagline}</p>}
            <div className="flex items-center flex-wrap gap-3 mb-4">
              <RatingBadge rating={s.vote_average} />
              {s.first_air_date && <span className="text-zinc-400 text-sm">{s.first_air_date.slice(0, 4)}</span>}
              {s.number_of_seasons && <span className="text-zinc-400 text-sm">{s.number_of_seasons} Season{s.number_of_seasons !== 1 ? 's' : ''}</span>}
              {s.genres?.map((g) => (
                <span key={g.id} className="text-xs border border-zinc-600 text-zinc-300 px-2 py-0.5 rounded-full">{g.name}</span>
              ))}
            </div>
            <p className="text-zinc-300 text-sm leading-relaxed mb-6 max-w-2xl">{s.overview}</p>
            <TVDetailClient
              tvId={id}
              tvName={s.name}
              posterPath={s.poster_path}
              voteAverage={s.vote_average}
              trailerKey={trailer?.key ?? null}
            />
          </div>
        </div>

        {s.seasons && s.seasons.length > 0 && (
          <div className="mt-12">
            <h3 className="text-lg font-bold text-white mb-4">Episodes</h3>
            <SeasonPicker tvId={id} seasons={s.seasons} />
          </div>
        )}

        {credits.cast.length > 0 && (
          <div className="mt-12">
            <CastRow cast={credits.cast} />
          </div>
        )}

        {similarItems.length > 0 && (
          <div className="mt-12 -mx-6 md:-mx-12">
            <ContentCarousel title="Similar Shows" items={similarItems} />
          </div>
        )}
      </div>
    </div>
  )
}
```

**Step 3: Create `app/tv/[id]/TVDetailClient.tsx`**

```typescript
'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Play, Heart, Youtube } from 'lucide-react'
import { useWatchlist } from '@/context/WatchlistContext'
import { TrailerModal } from '@/components/TrailerModal'

interface Props {
  tvId: number
  tvName: string
  posterPath: string | null
  voteAverage: number
  trailerKey: string | null
}

export function TVDetailClient({ tvId, tvName, posterPath, voteAverage, trailerKey }: Props) {
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist()
  const [showTrailer, setShowTrailer] = useState(false)
  const inList = isInWatchlist(tvId)

  function toggleWatchlist() {
    if (inList) {
      removeFromWatchlist(tvId)
    } else {
      addToWatchlist({
        id: tvId, type: 'tv', title: tvName,
        poster_path: posterPath, vote_average: voteAverage,
        addedAt: new Date().toISOString(),
      })
    }
  }

  return (
    <>
      <div className="flex flex-wrap gap-3">
        <Link
          href={`/watch/tv/${tvId}?s=1&e=1`}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2.5 rounded-md transition-colors"
        >
          <Play size={18} fill="white" /> Watch Now
        </Link>
        <button
          onClick={toggleWatchlist}
          className={`flex items-center gap-2 border font-semibold px-6 py-2.5 rounded-md transition-colors ${
            inList ? 'border-red-600 text-red-600 hover:bg-red-600/10' : 'border-zinc-600 text-zinc-300 hover:border-zinc-400 hover:text-white'
          }`}
        >
          <Heart size={18} fill={inList ? 'currentColor' : 'none'} />
          {inList ? 'In Watchlist' : 'Add to Watchlist'}
        </button>
        {trailerKey && (
          <button
            onClick={() => setShowTrailer(true)}
            className="flex items-center gap-2 border border-zinc-600 text-zinc-300 hover:text-white hover:border-zinc-400 font-semibold px-6 py-2.5 rounded-md transition-colors"
          >
            <Youtube size={18} /> Trailer
          </button>
        )}
      </div>
      {showTrailer && trailerKey && (
        <TrailerModal videoKey={trailerKey} onClose={() => setShowTrailer(false)} />
      )}
    </>
  )
}
```

**Step 4: Commit**

```bash
git add components/SeasonPicker.tsx app/tv/
git commit -m "feat: add TV detail page with season/episode picker"
```

---

## Phase 4 — Player & Watch Pages

### Task 19: Player Component

**Files:**
- Create: `components/Player.tsx`
- Test: `__tests__/components/Player.test.tsx`

**Step 1: Write the failing test**

Create `__tests__/components/Player.test.tsx`:
```typescript
import { render, screen } from '@testing-library/react'
import { Player } from '@/components/Player'

describe('Player', () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv, NEXT_PUBLIC_EMBED_BASE_URL: 'https://example.com' }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('renders movie iframe with correct src', () => {
    render(<Player type="movie" id={123} />)
    const iframe = screen.getByTitle('Video Player')
    expect(iframe).toHaveAttribute('src', 'https://example.com/movie/123')
  })

  it('renders TV iframe with season and episode', () => {
    render(<Player type="tv" id={456} season={2} episode={3} />)
    const iframe = screen.getByTitle('Video Player')
    expect(iframe).toHaveAttribute('src', 'https://example.com/tv/456/2/3')
  })

  it('shows config message when EMBED_BASE_URL is not set', () => {
    process.env.NEXT_PUBLIC_EMBED_BASE_URL = ''
    render(<Player type="movie" id={1} />)
    expect(screen.getByText(/embed URL not configured/i)).toBeInTheDocument()
  })
})
```

**Step 2: Run test to verify it fails**

```bash
npm test -- __tests__/components/Player.test.tsx
```
Expected: FAIL

**Step 3: Create `components/Player.tsx`**

```typescript
interface PlayerProps {
  type: 'movie' | 'tv'
  id: number
  season?: number
  episode?: number
}

export function Player({ type, id, season, episode }: PlayerProps) {
  const base = process.env.NEXT_PUBLIC_EMBED_BASE_URL

  if (!base) {
    return (
      <div className="w-full aspect-video bg-zinc-900 flex items-center justify-center rounded-lg">
        <p className="text-zinc-400 text-sm">
          Embed URL not configured. Set{' '}
          <code className="text-red-400">NEXT_PUBLIC_EMBED_BASE_URL</code> in{' '}
          <code className="text-red-400">.env.local</code>.
        </p>
      </div>
    )
  }

  const src =
    type === 'movie'
      ? `${base}/movie/${id}`
      : `${base}/tv/${id}/${season ?? 1}/${episode ?? 1}`

  return (
    <iframe
      src={src}
      title="Video Player"
      className="w-full aspect-video rounded-lg"
      sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
      referrerPolicy="origin"
      allowFullScreen
    />
  )
}
```

**Step 4: Run test to verify it passes**

```bash
npm test -- __tests__/components/Player.test.tsx
```
Expected: PASS

**Step 5: Commit**

```bash
git add components/Player.tsx __tests__/components/Player.test.tsx
git commit -m "feat: add Player component with env-based embed URL"
```

---

### Task 20: BackButton Component & Movie Watch Page

**Files:**
- Create: `components/BackButton.tsx`
- Create: `app/watch/movie/[id]/page.tsx`

**Step 1: Create `components/BackButton.tsx`**

```typescript
'use client'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

export function BackButton() {
  const router = useRouter()
  return (
    <button
      onClick={() => router.back()}
      className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm"
    >
      <ArrowLeft size={16} /> Back
    </button>
  )
}
```

**Step 2: Create `app/watch/movie/[id]/page.tsx`**

```typescript
import { notFound } from 'next/navigation'
import { getDetails } from '@/lib/tmdb'
import { Player } from '@/components/Player'
import { BackButton } from '@/components/BackButton'
import type { Movie } from '@/lib/types'
import { MovieWatchClient } from './MovieWatchClient'

interface Props { params: { id: string } }

export async function generateMetadata({ params }: Props) {
  const movie = await getDetails('movie', Number(params.id)).catch(() => null) as Movie | null
  return { title: movie ? `Watch ${movie.title} — CineStream` : 'Watch — CineStream' }
}

export default async function WatchMoviePage({ params }: Props) {
  const id = Number(params.id)
  if (isNaN(id)) notFound()

  const movie = await getDetails('movie', id).catch(() => null) as Movie | null
  if (!movie) notFound()

  return (
    <div className="pt-16 min-h-screen bg-[#141414]">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="mb-4">
          <BackButton />
        </div>
        <Player type="movie" id={id} />
        <MovieWatchClient
          movieId={id}
          movieTitle={movie.title}
          posterPath={movie.poster_path}
          overview={movie.overview}
        />
      </div>
    </div>
  )
}
```

**Step 3: Create `app/watch/movie/[id]/MovieWatchClient.tsx`**

```typescript
'use client'
import { useEffect } from 'react'
import { useWatchlist } from '@/context/WatchlistContext'

interface Props {
  movieId: number
  movieTitle: string
  posterPath: string | null
  overview: string
}

export function MovieWatchClient({ movieId, movieTitle, posterPath, overview }: Props) {
  const { addToHistory } = useWatchlist()

  useEffect(() => {
    addToHistory({
      id: movieId, type: 'movie', title: movieTitle,
      poster_path: posterPath, watchedAt: new Date().toISOString(),
    })
  }, [movieId]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="mt-6">
      <h1 className="text-2xl font-bold text-white mb-2">{movieTitle}</h1>
      <p className="text-zinc-400 text-sm leading-relaxed max-w-3xl">{overview}</p>
    </div>
  )
}
```

**Step 4: Commit**

```bash
git add components/BackButton.tsx app/watch/movie/
git commit -m "feat: add movie watch page with player and history tracking"
```

---

### Task 21: TV Watch Page

**Files:**
- Create: `app/watch/tv/[id]/page.tsx`
- Create: `app/watch/tv/[id]/TVWatchClient.tsx`

**Step 1: Create `app/watch/tv/[id]/page.tsx`**

```typescript
import { notFound } from 'next/navigation'
import { getDetails, getSeasonDetails } from '@/lib/tmdb'
import { Player } from '@/components/Player'
import { BackButton } from '@/components/BackButton'
import type { TVShow } from '@/lib/types'
import { TVWatchClient } from './TVWatchClient'

interface Props {
  params: { id: string }
  searchParams: { s?: string; e?: string }
}

export default async function WatchTVPage({ params, searchParams }: Props) {
  const id = Number(params.id)
  const season = Number(searchParams.s ?? 1)
  const episode = Number(searchParams.e ?? 1)
  if (isNaN(id)) notFound()

  const [show, seasonData] = await Promise.all([
    getDetails('tv', id).catch(() => null),
    getSeasonDetails(id, season).catch(() => null),
  ])

  if (!show) notFound()
  const s = show as TVShow

  return (
    <div className="pt-16 min-h-screen bg-[#141414]">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="mb-4">
          <BackButton />
        </div>
        <Player type="tv" id={id} season={season} episode={episode} />
        <TVWatchClient
          tvId={id}
          tvName={s.name}
          posterPath={s.poster_path}
          season={season}
          episode={episode}
          episodes={seasonData?.episodes ?? []}
          overview={s.overview}
        />
      </div>
    </div>
  )
}
```

**Step 2: Create `app/watch/tv/[id]/TVWatchClient.tsx`**

```typescript
'use client'
import { useEffect } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useWatchlist } from '@/context/WatchlistContext'
import type { Episode } from '@/lib/types'

interface Props {
  tvId: number
  tvName: string
  posterPath: string | null
  season: number
  episode: number
  episodes: Episode[]
  overview: string
}

export function TVWatchClient({ tvId, tvName, posterPath, season, episode, episodes, overview }: Props) {
  const { addToHistory } = useWatchlist()
  const currentEp = episodes.find((e) => e.episode_number === episode)
  const prevEp = episodes.find((e) => e.episode_number === episode - 1)
  const nextEp = episodes.find((e) => e.episode_number === episode + 1)

  useEffect(() => {
    addToHistory({
      id: tvId, type: 'tv', title: tvName,
      poster_path: posterPath, season, episode,
      watchedAt: new Date().toISOString(),
    })
  }, [tvId, season, episode]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="mt-6">
      <h1 className="text-2xl font-bold text-white mb-1">{tvName}</h1>
      {currentEp && (
        <p className="text-zinc-400 text-sm mb-2">
          Season {season} · Episode {episode}: {currentEp.name}
        </p>
      )}
      <p className="text-zinc-400 text-sm leading-relaxed max-w-3xl mb-6">
        {currentEp?.overview || overview}
      </p>

      {/* Prev / Next navigation */}
      <div className="flex gap-3 mb-8">
        {prevEp && (
          <Link
            href={`/watch/tv/${tvId}?s=${season}&e=${prevEp.episode_number}`}
            className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-md transition-colors text-sm"
          >
            <ChevronLeft size={16} /> Previous Episode
          </Link>
        )}
        {nextEp && (
          <Link
            href={`/watch/tv/${tvId}?s=${season}&e=${nextEp.episode_number}`}
            className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-md transition-colors text-sm"
          >
            Next Episode <ChevronRight size={16} />
          </Link>
        )}
      </div>

      {/* Episode list for current season */}
      {episodes.length > 0 && (
        <div>
          <h3 className="text-base font-bold text-white mb-3">Season {season} Episodes</h3>
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {episodes.map((ep) => (
              <Link
                key={ep.id}
                href={`/watch/tv/${tvId}?s=${season}&e=${ep.episode_number}`}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                  ep.episode_number === episode
                    ? 'bg-red-600/20 text-white border border-red-600/30'
                    : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                }`}
              >
                <span className="shrink-0 w-6 text-zinc-500 text-xs">{ep.episode_number}</span>
                <span className="truncate">{ep.name}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
```

**Step 3: Commit**

```bash
git add app/watch/tv/
git commit -m "feat: add TV watch page with episode navigation and history tracking"
```

---

## Phase 5 — Search & Browse

### Task 22: Search Page

**Files:**
- Create: `app/search/page.tsx`

**Step 1: Create `app/search/page.tsx`**

```typescript
'use client'
import { useSearchParams } from 'next/navigation'
import { useState, useEffect, Suspense } from 'react'
import { searchMulti } from '@/lib/tmdb'
import { MediaCard } from '@/components/MediaCard'
import { SkeletonCard } from '@/components/SkeletonCard'
import type { MediaItem } from '@/lib/types'

function SearchResults() {
  const params = useSearchParams()
  const query = params.get('q') ?? ''
  const [results, setResults] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState<'all' | 'movie' | 'tv'>('all')

  useEffect(() => {
    if (!query) { setResults([]); return }
    setLoading(true)
    searchMulti(query)
      .then((data) => {
        const items = data.results.filter((r: any) => r.media_type === 'movie' || r.media_type === 'tv') as MediaItem[]
        setResults(items)
      })
      .catch(() => setResults([]))
      .finally(() => setLoading(false))
  }, [query])

  const filtered = tab === 'all' ? results : results.filter((r) => r.media_type === tab)

  return (
    <div className="pt-20 px-6 md:px-12 min-h-screen">
      <h1 className="text-2xl font-bold text-white mb-2">
        {query ? `Results for "${query}"` : 'Search'}
      </h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {(['all', 'movie', 'tv'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              tab === t ? 'bg-red-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            {t === 'all' ? 'All' : t === 'movie' ? 'Movies' : 'TV Shows'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-4">
          {Array.from({ length: 14 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-zinc-400 text-lg">{query ? 'No results found.' : 'Type something to search.'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-4">
          {filtered.map((item) => <MediaCard key={`${item.media_type}-${item.id}`} item={item} />)}
        </div>
      )}
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="pt-20 px-6 text-zinc-400">Loading...</div>}>
      <SearchResults />
    </Suspense>
  )
}
```

**Step 2: Commit**

```bash
git add app/search/
git commit -m "feat: add search results page with tabs and grid layout"
```

---

### Task 23: GenreFilter Component

**Files:**
- Create: `components/GenreFilter.tsx`
- Test: `__tests__/components/GenreFilter.test.tsx`

**Step 1: Write the failing test**

Create `__tests__/components/GenreFilter.test.tsx`:
```typescript
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GenreFilter } from '@/components/GenreFilter'

const genres = [
  { id: 28, name: 'Action' },
  { id: 18, name: 'Drama' },
]

describe('GenreFilter', () => {
  it('renders all genres', () => {
    render(<GenreFilter genres={genres} selected={null} onSelect={() => {}} />)
    expect(screen.getByText('All')).toBeInTheDocument()
    expect(screen.getByText('Action')).toBeInTheDocument()
    expect(screen.getByText('Drama')).toBeInTheDocument()
  })

  it('calls onSelect with null when All is clicked', async () => {
    const user = userEvent.setup()
    const onSelect = jest.fn()
    render(<GenreFilter genres={genres} selected={28} onSelect={onSelect} />)
    await user.click(screen.getByText('All'))
    expect(onSelect).toHaveBeenCalledWith(null)
  })

  it('calls onSelect with genre id when genre is clicked', async () => {
    const user = userEvent.setup()
    const onSelect = jest.fn()
    render(<GenreFilter genres={genres} selected={null} onSelect={onSelect} />)
    await user.click(screen.getByText('Action'))
    expect(onSelect).toHaveBeenCalledWith(28)
  })
})
```

**Step 2: Run test to verify it fails**

```bash
npm test -- __tests__/components/GenreFilter.test.tsx
```
Expected: FAIL

**Step 3: Create `components/GenreFilter.tsx`**

```typescript
import type { Genre } from '@/lib/types'

interface GenreFilterProps {
  genres: Genre[]
  selected: number | null
  onSelect: (id: number | null) => void
}

export function GenreFilter({ genres, selected, onSelect }: GenreFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
      <button
        onClick={() => onSelect(null)}
        className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
          selected === null ? 'bg-red-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-white'
        }`}
      >
        All
      </button>
      {genres.map((g) => (
        <button
          key={g.id}
          onClick={() => onSelect(g.id)}
          className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            selected === g.id ? 'bg-red-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-white'
          }`}
        >
          {g.name}
        </button>
      ))}
    </div>
  )
}
```

**Step 4: Run test to verify it passes**

```bash
npm test -- __tests__/components/GenreFilter.test.tsx
```
Expected: PASS

**Step 5: Commit**

```bash
git add components/GenreFilter.tsx __tests__/components/GenreFilter.test.tsx
git commit -m "feat: add GenreFilter component"
```

---

### Task 24: Browse Pages

**Files:**
- Create: `app/browse/movies/page.tsx`
- Create: `app/browse/tv/page.tsx`

**Step 1: Create `app/browse/movies/page.tsx`**

```typescript
import { getGenres } from '@/lib/tmdb'
import { BrowseClient } from './BrowseClient'

export const metadata = { title: 'Browse Movies — CineStream' }

export default async function BrowseMoviesPage() {
  const genreData = await getGenres('movie').catch(() => ({ genres: [] }))
  return <BrowseClient mediaType="movie" genres={genreData.genres} />
}
```

**Step 2: Create `app/browse/movies/BrowseClient.tsx`**

```typescript
'use client'
import { useState, useEffect, useCallback } from 'react'
import { getPopular, discoverByGenre } from '@/lib/tmdb'
import { GenreFilter } from '@/components/GenreFilter'
import { MediaCard } from '@/components/MediaCard'
import { SkeletonCard } from '@/components/SkeletonCard'
import type { Genre, MediaItem } from '@/lib/types'

interface BrowseClientProps {
  mediaType: 'movie' | 'tv'
  genres: Genre[]
}

export function BrowseClient({ mediaType, genres }: BrowseClientProps) {
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null)
  const [items, setItems] = useState<MediaItem[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)

  const fetchItems = useCallback(async (genreId: number | null, p: number) => {
    setLoading(true)
    try {
      const data = genreId
        ? await discoverByGenre(mediaType, genreId, p)
        : await getPopular(mediaType, p)
      const tagged = data.results.map((i: any) => ({ ...i, media_type: mediaType })) as MediaItem[]
      setItems((prev) => p === 1 ? tagged : [...prev, ...tagged])
      setTotalPages(data.total_pages)
    } catch {}
    setLoading(false)
  }, [mediaType])

  useEffect(() => {
    setPage(1)
    setItems([])
    fetchItems(selectedGenre, 1)
  }, [selectedGenre, fetchItems])

  function loadMore() {
    const next = page + 1
    setPage(next)
    fetchItems(selectedGenre, next)
  }

  return (
    <div className="pt-20 px-6 md:px-12 min-h-screen">
      <h1 className="text-2xl font-bold text-white mb-4">
        Browse {mediaType === 'movie' ? 'Movies' : 'TV Shows'}
      </h1>
      <div className="mb-6">
        <GenreFilter genres={genres} selected={selectedGenre} onSelect={setSelectedGenre} />
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-4 mb-8">
        {items.map((item) => <MediaCard key={`${item.media_type}-${item.id}`} item={item} />)}
        {loading && Array.from({ length: 7 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
      {!loading && page < totalPages && (
        <div className="text-center pb-12">
          <button
            onClick={loadMore}
            className="bg-zinc-800 hover:bg-zinc-700 text-white px-8 py-2.5 rounded-md transition-colors font-medium"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  )
}
```

**Step 3: Create `app/browse/tv/page.tsx`**

```typescript
import { getGenres } from '@/lib/tmdb'
import { BrowseClient } from '../movies/BrowseClient'

export const metadata = { title: 'Browse TV Shows — CineStream' }

export default async function BrowseTVPage() {
  const genreData = await getGenres('tv').catch(() => ({ genres: [] }))
  return <BrowseClient mediaType="tv" genres={genreData.genres} />
}
```

**Step 4: Commit**

```bash
git add app/browse/
git commit -m "feat: add browse pages with genre filtering and load more pagination"
```

---

## Phase 6 — Watchlist Page & Polish

### Task 25: Watchlist Page

**Files:**
- Create: `app/watchlist/page.tsx`

**Step 1: Create `app/watchlist/page.tsx`**

```typescript
'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Trash2 } from 'lucide-react'
import Image from 'next/image'
import { useWatchlist } from '@/context/WatchlistContext'
import { posterURL } from '@/lib/constants'
import { RatingBadge } from '@/components/RatingBadge'

export default function WatchlistPage() {
  const { watchlist, removeFromWatchlist } = useWatchlist()
  const [tab, setTab] = useState<'all' | 'movie' | 'tv'>('all')

  const filtered = tab === 'all' ? watchlist : watchlist.filter((i) => i.type === tab)

  return (
    <div className="pt-20 px-6 md:px-12 min-h-screen">
      <h1 className="text-2xl font-bold text-white mb-2">My Watchlist</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {(['all', 'movie', 'tv'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              tab === t ? 'bg-red-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            {t === 'all' ? `All (${watchlist.length})` : t === 'movie' ? 'Movies' : 'TV Shows'}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-zinc-400 text-lg mb-4">Your watchlist is empty.</p>
          <div className="flex gap-3 justify-center">
            <Link href="/browse/movies" className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-md transition-colors font-medium">
              Browse Movies
            </Link>
            <Link href="/browse/tv" className="bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-2.5 rounded-md transition-colors font-medium">
              Browse TV Shows
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-4">
          {filtered.map((item) => (
            <div key={`${item.type}-${item.id}`} className="relative group">
              <Link href={`/${item.type}/${item.id}`} className="block">
                <div className="relative aspect-[2/3] bg-zinc-800 rounded-lg overflow-hidden mb-2">
                  <Image
                    src={posterURL(item.poster_path)}
                    alt={item.title}
                    fill
                    loading="lazy"
                    className="object-cover group-hover:scale-105 transition-transform duration-200"
                    sizes="(max-width: 768px) 144px, 176px"
                  />
                </div>
                <p className="text-sm text-zinc-300 truncate">{item.title}</p>
                <RatingBadge rating={item.vote_average} className="mt-1" />
              </Link>
              <button
                onClick={() => removeFromWatchlist(item.id)}
                className="absolute top-2 right-2 bg-black/60 hover:bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200"
                aria-label={`Remove ${item.title} from watchlist`}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add app/watchlist/
git commit -m "feat: add watchlist page with remove and empty state"
```

---

### Task 26: 404 Page & Error States

**Files:**
- Create: `app/not-found.tsx`
- Create: `app/error.tsx`

**Step 1: Create `app/not-found.tsx`**

```typescript
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="pt-16 min-h-screen flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-8xl font-bold text-red-600 mb-4">404</h1>
      <h2 className="text-2xl font-bold text-white mb-2">Page Not Found</h2>
      <p className="text-zinc-400 mb-8">The page you're looking for doesn't exist.</p>
      <Link href="/" className="bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-3 rounded-md transition-colors">
        Go Home
      </Link>
    </div>
  )
}
```

**Step 2: Create `app/error.tsx`**

```typescript
'use client'
import { useEffect } from 'react'

interface Props { error: Error; reset: () => void }

export default function ErrorPage({ error, reset }: Props) {
  useEffect(() => { console.error(error) }, [error])
  return (
    <div className="pt-16 min-h-screen flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-4xl font-bold text-white mb-3">Something went wrong</h1>
      <p className="text-zinc-400 mb-8">{error.message || 'An unexpected error occurred.'}</p>
      <button
        onClick={reset}
        className="bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-3 rounded-md transition-colors"
      >
        Try Again
      </button>
    </div>
  )
}
```

**Step 3: Commit**

```bash
git add app/not-found.tsx app/error.tsx
git commit -m "feat: add 404 and error boundary pages"
```

---

### Task 27: Final Build Verification

**Step 1: Run full test suite**

```bash
npm test
```
Expected: All tests PASS

**Step 2: Run production build**

```bash
npm run build
```
Expected: No TypeScript errors. Build completes successfully.

**Step 3: Smoke test in browser**

```bash
npm run dev
```

Manually verify each route:
- [ ] `/` — Hero banner auto-rotates, all 6 carousels load
- [ ] `/movie/[any-tmdb-id]` (e.g. `/movie/550`) — Backdrop, poster, cast, trailer button
- [ ] `/tv/[any-tmdb-id]` (e.g. `/tv/1396`) — Season picker loads episodes
- [ ] `/watch/movie/550` — Player iframe renders
- [ ] `/watch/tv/1396?s=1&e=1` — Player + episode list
- [ ] `/search?q=batman` — Results grid with tabs
- [ ] `/browse/movies` — Genre filter works, Load More works
- [ ] `/browse/tv` — Genre filter works
- [ ] `/watchlist` — Shows items, remove works
- [ ] `/doesnotexist` — 404 page shows

**Step 4: Commit**

```bash
git add -A
git commit -m "chore: final build verification — CineStream v1 complete"
```

---

## Summary

| Phase | Tasks | Key Components |
|-------|-------|----------------|
| 1 — Foundation | 1–6 | Types, TMDB client, hooks |
| 2 — Homepage | 7–14 | Layout, Navbar, HeroBanner, Carousels |
| 3 — Detail pages | 15–18 | Movie/TV detail, SeasonPicker, CastRow |
| 4 — Player | 19–21 | Player iframe, Watch pages |
| 5 — Discovery | 22–24 | Search, Browse, GenreFilter |
| 6 — Watchlist & Polish | 25–27 | Watchlist page, 404, error boundary |

**Total commits: ~25** | **All features TDD where possible** | **No auth, no DB, no backend**
