# CineStream — CLAUDE.md

> **Local-only Netflix-style streaming app.** Browse movies & TV shows via TMDB, watch via configurable embed player. Runs on `localhost`, single user, no auth.

---

## Project Identity

| Key | Value |
|-----|-------|
| Name | CineStream |
| Type | Local web application (Next.js) |
| Platform | Windows desktop, runs on localhost |
| User | Single user, no authentication |
| Data persistence | localStorage (watchlist, history, preferences) |

---

## Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Framework | Next.js 14 (App Router) | `npx create-next-app@14` with TypeScript |
| Styling | Tailwind CSS | Dark theme by default |
| Data source | TMDB API v3 | Free key from themoviedb.org |
| Player | Configurable iframe embed | URL pattern set via env variable |
| State | React Context + localStorage | SSR-safe pattern (read in useEffect) |
| Language | TypeScript | Strict mode |
| Package manager | npm | |
| Icons | Lucide React | |
| Animations | Framer Motion | Page transitions, hover effects |

---

## Environment Variables (.env.local)

```env
NEXT_PUBLIC_TMDB_API_KEY=<tmdb_api_key>
NEXT_PUBLIC_EMBED_BASE_URL=<embed_provider_base_url>
```

The user supplies both values before running. Do NOT hardcode either.

---

## Folder Structure

```
cinestream/
├── .env.local                    # TMDB key + embed base URL
├── CLAUDE.md                     # This file
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── public/
│   └── logo.svg
├── src/
│   ├── app/
│   │   ├── layout.tsx            # Root layout — navbar, providers, dark bg
│   │   ├── page.tsx              # Homepage — hero + carousels
│   │   ├── search/
│   │   │   └── page.tsx          # Search results page
│   │   ├── browse/
│   │   │   ├── movies/
│   │   │   │   └── page.tsx      # Browse movies by genre
│   │   │   └── tv/
│   │   │       └── page.tsx      # Browse TV shows by genre
│   │   ├── movie/
│   │   │   └── [id]/
│   │   │       └── page.tsx      # Movie detail page
│   │   ├── tv/
│   │   │   └── [id]/
│   │   │       └── page.tsx      # TV show detail page
│   │   ├── watch/
│   │   │   ├── movie/
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx  # Movie player page
│   │   │   └── tv/
│   │   │       └── [id]/
│   │   │           └── page.tsx  # TV player page (season/ep params)
│   │   └── watchlist/
│   │       └── page.tsx          # User's saved titles
│   ├── components/
│   │   ├── Navbar.tsx            # Top nav — logo, search, watchlist link
│   │   ├── HeroBanner.tsx        # Full-width featured title with backdrop
│   │   ├── ContentCarousel.tsx   # Horizontal scrolling row of cards
│   │   ├── MediaCard.tsx         # Poster card with hover overlay
│   │   ├── Player.tsx            # Iframe embed component
│   │   ├── SearchBar.tsx         # Debounced search input
│   │   ├── GenreFilter.tsx       # Genre tag selector
│   │   ├── SeasonPicker.tsx      # Dropdown for season/episode selection
│   │   ├── CastRow.tsx           # Horizontal cast member cards
│   │   ├── TrailerModal.tsx      # YouTube trailer in modal
│   │   ├── RatingBadge.tsx       # Color-coded score badge
│   │   ├── SkeletonCard.tsx      # Loading placeholder
│   │   └── BackButton.tsx        # Return from watch page
│   ├── context/
│   │   └── WatchlistContext.tsx   # Watchlist + history provider
│   ├── hooks/
│   │   ├── useDebounce.ts        # 300ms debounced value
│   │   ├── useLocalStorage.ts    # SSR-safe localStorage hook
│   │   └── useTMDB.ts            # SWR-style TMDB fetcher (optional)
│   ├── lib/
│   │   ├── tmdb.ts               # All TMDB API functions
│   │   ├── constants.ts          # Image base URLs, genre maps
│   │   └── types.ts              # Movie, TVShow, Season, Episode, Cast, Video
│   └── styles/
│       └── globals.css           # Tailwind imports + custom scrollbar
```

---

## TMDB API Client (lib/tmdb.ts)

Base URL: `https://api.themoviedb.org/3`
Auth: `?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`

### Required Functions

```typescript
// Discovery
getTrending(mediaType: 'movie' | 'tv', timeWindow: 'day' | 'week')
getPopular(mediaType: 'movie' | 'tv', page?: number)
getTopRated(mediaType: 'movie' | 'tv', page?: number)
getNowPlaying(page?: number)                          // movies in theaters
getOnTheAir(page?: number)                             // currently airing TV

// Details
getDetails(mediaType: 'movie' | 'tv', id: number)
getCredits(mediaType: 'movie' | 'tv', id: number)
getSimilar(mediaType: 'movie' | 'tv', id: number)
getVideos(mediaType: 'movie' | 'tv', id: number)       // trailers
getSeasonDetails(tvId: number, seasonNumber: number)

// Search & Filter
searchMulti(query: string, page?: number)
discoverByGenre(mediaType: 'movie' | 'tv', genreId: number, page?: number)
getGenres(mediaType: 'movie' | 'tv')
```

### Image Helper

```typescript
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

export function posterURL(path: string | null, size: 'w200' | 'w342' | 'w500' | 'original' = 'w342') {
  if (!path) return '/placeholder-poster.png';
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

export function backdropURL(path: string | null, size: 'w780' | 'w1280' | 'original' = 'w1280') {
  if (!path) return '/placeholder-backdrop.png';
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}
```

Add `image.tmdb.org` to `next.config.js` → `images.remotePatterns`.

---

## Player / Embed Layer

The player is a single iframe component. The embed URL is constructed from the env variable:

```typescript
// components/Player.tsx
interface PlayerProps {
  type: 'movie' | 'tv';
  id: number;
  season?: number;
  episode?: number;
}

// Movie:  {EMBED_BASE_URL}/movie/{tmdb_id}
// TV:     {EMBED_BASE_URL}/tv/{tmdb_id}/{season}/{episode}
```

If `NEXT_PUBLIC_EMBED_BASE_URL` is not set, show a config message instead of a broken iframe.

Use `sandbox="allow-same-origin allow-scripts allow-forms allow-popups"` on the iframe.
Use `referrerPolicy="origin"`.

---

## Page Specifications

### Homepage (`/`)
- **Hero Banner**: Random title from trending/day. Full-width backdrop, title, overview (truncated), rating badge, "Watch Now" + "More Info" buttons. Auto-rotate every 8s with fade transition.
- **Carousels** (each is a `ContentCarousel`):
  1. Trending Today (movie, day)
  2. Popular Movies
  3. Popular TV Shows
  4. Top Rated Movies
  5. Now Playing (theaters)
  6. On The Air (TV)
- Each carousel: horizontal scroll with arrow buttons, 6-7 visible cards, smooth scroll behavior.

### Movie Detail (`/movie/[id]`)
- Backdrop as page header with gradient overlay
- Poster (left) + info (right): title, tagline, year, runtime, genres, rating badge, overview
- "Watch Now" button → navigates to `/watch/movie/{id}`
- "Add to Watchlist" toggle (heart icon)
- Cast row (horizontal scroll of profile images + names)
- Trailer button → opens YouTube modal (first video from getVideos)
- Similar Movies carousel at bottom

### TV Show Detail (`/tv/[id]`)
- Same layout as movie detail
- **Season Picker**: dropdown to select season → loads episodes via getSeasonDetails
- Episode list: cards with still image, episode number, name, overview, air date
- Clicking episode → `/watch/tv/{id}?s={season}&e={episode}`

### Watch Page (`/watch/movie/[id]` and `/watch/tv/[id]`)
- Full-width Player component (16:9 aspect ratio)
- Dark background, minimal UI
- Below player: title, overview, back button
- For TV: next/previous episode buttons, episode list for current season

### Search (`/search?q={query}`)
- Debounced input (300ms) in navbar triggers navigation
- Results grid: poster cards in responsive grid
- Tabs: All / Movies / TV Shows
- Infinite scroll or "Load More" button (page param)

### Browse (`/browse/movies` and `/browse/tv`)
- Genre filter bar at top (horizontal scrollable tags from getGenres)
- Responsive grid of poster cards
- Infinite scroll with page tracking

### Watchlist (`/watchlist`)
- Grid of saved titles from localStorage
- Tabs: All / Movies / TV Shows
- Remove button on each card
- Empty state with "Browse" CTA

---

## Styling Rules

| Element | Classes |
|---------|---------|
| Page background | `bg-[#141414]` |
| Card background | `bg-[#1a1a1a]` with `hover:scale-105 transition-transform duration-200` |
| Primary accent | `text-red-600` / `bg-red-600` (buttons, logo) |
| Rating ≥ 7.0 | `bg-green-500 text-black` |
| Rating ≥ 5.0 | `bg-yellow-500 text-black` |
| Rating < 5.0 | `bg-red-500 text-white` |
| Primary text | `text-white` |
| Secondary text | `text-zinc-400` |
| All images | `next/image` with proper width/height or fill + `loading="lazy"` |
| Rounded corners | `rounded-lg` cards, `rounded-md` buttons |
| Hover states | Required on every interactive element |
| Scrollbar | Custom thin scrollbar via globals.css |
| Transitions | `transition-all duration-200` default |

### Typography
- Title/headings: `font-bold text-white`
- Body text: `text-sm text-zinc-300` or `text-zinc-400`
- No serif fonts. System sans-serif stack via Tailwind defaults.

---

## localStorage Schema

```typescript
// Watchlist
interface WatchlistItem {
  id: number;
  type: 'movie' | 'tv';
  title: string;
  poster_path: string | null;
  vote_average: number;
  addedAt: string; // ISO timestamp
}
// Key: "cinestream_watchlist" → WatchlistItem[]

// Watch History
interface HistoryItem {
  id: number;
  type: 'movie' | 'tv';
  title: string;
  poster_path: string | null;
  season?: number;
  episode?: number;
  watchedAt: string; // ISO timestamp
}
// Key: "cinestream_history" → HistoryItem[]

// Preferences
// Key: "cinestream_prefs" → { volume?: number }
```

### SSR-Safe localStorage Pattern

```typescript
function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(key);
    if (stored) setValue(JSON.parse(stored));
    setHydrated(true);
  }, [key]);

  useEffect(() => {
    if (hydrated) localStorage.setItem(key, JSON.stringify(value));
  }, [key, value, hydrated]);

  return [value, setValue, hydrated] as const;
}
```

**Never** read localStorage at module level or in server components. Always in `useEffect`. Render skeleton/placeholder until hydrated to avoid mismatch.

---

## Build Phases

### Phase 1 — Scaffolding & TMDB Client
- `npx create-next-app@14` with TypeScript, Tailwind, App Router
- Install deps: `framer-motion`, `lucide-react`
- Create `lib/tmdb.ts` with all functions listed above
- Create `lib/types.ts` with all TypeScript interfaces
- Create `lib/constants.ts` with image helpers
- Set up `next.config.js` with TMDB image domain
- Verify: run dev server, console.log a trending fetch

### Phase 2 — Homepage & Layout
- Root layout: dark background, Navbar component
- Navbar: logo, search input (navigates to /search), watchlist link
- HeroBanner: random trending title, backdrop, buttons
- ContentCarousel: reusable horizontal scroll row
- MediaCard: poster with hover overlay showing title + rating
- SkeletonCard: loading placeholder
- Wire up homepage with 6 carousels from TMDB data

### Phase 3 — Detail Pages
- Movie detail page with full info layout
- TV show detail page with season/episode picker
- CastRow, RatingBadge, TrailerModal components
- "Watch Now" and "Add to Watchlist" buttons

### Phase 4 — Player & Watch Pages
- Player.tsx iframe component with env-based URL
- Movie watch page: full-width player + info below
- TV watch page: player + episode navigation
- Back button overlay

### Phase 5 — Search, Browse, Filter
- SearchBar with 300ms debounce
- Search results page with tabs (All/Movies/TV)
- Browse pages with genre filter bar
- Infinite scroll or load-more pagination

### Phase 6 — Watchlist, History, Polish
- WatchlistContext provider wrapping the app
- Watchlist page with remove functionality
- Watch history tracking (auto-save on watch page visit)
- Continue Watching carousel on homepage
- Page transitions with framer-motion
- Empty states, error states, 404 page
- Responsive testing at mobile/tablet/desktop

---

## Common Pitfalls

- **Don't fetch on client if you can fetch on server.** Use Next.js server components for initial TMDB data loads. Client components only for interactivity (search input, watchlist toggle, episode picker).
- **Don't forget `"use client"`** on components using hooks, event handlers, or browser APIs.
- **Image domains**: `image.tmdb.org` must be in `next.config.js` `images.remotePatterns`.
- **Don't over-fetch**: Use `Promise.all` for parallel requests on pages needing multiple endpoints.
- **localStorage is not available during SSR**: Always read in `useEffect`, never at module level.
- **Hydration mismatches**: Render placeholder on server, real value on client for localStorage-derived state.
- **API rate limits**: TMDB allows ~40 requests/10 seconds. Don't fire 20 parallel requests on page load — batch and prioritize.
- **Null poster/backdrop paths**: Always handle `null` with a fallback image.
- **All file paths**: Use forward slashes. This is a Next.js project, not raw Windows paths.

---

## Quality Checklist (per phase)

- [ ] No TypeScript errors (`npm run build` passes)
- [ ] No console errors in browser
- [ ] Responsive at 375px, 768px, 1280px, 1920px
- [ ] All images lazy loaded with next/image
- [ ] Loading skeletons for every async content block
- [ ] Hover states on all interactive elements
- [ ] Page navigation works (back/forward, direct URL)
- [ ] Page titles set via Next.js Metadata API
- [ ] Dark theme consistent across all pages
- [ ] No layout shift on load
