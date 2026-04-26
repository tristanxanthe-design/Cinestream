'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Play, Heart, Share2, ChevronLeft, ChevronRight } from 'lucide-react'
import {
  getTrending,
  getPopular,
  getSimilar,
  getNowPlaying,
} from '@/lib/tmdb'
import type { MediaItem, Movie, TVShow } from '@/lib/types'
import { useWatchlist } from '@/context/WatchlistContext'

// ─── Genre map ────────────────────────────────────────────────────────────────

const GENRE_MAP: Record<number, string> = {
  28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy',
  80: 'Crime', 99: 'Documentary', 18: 'Drama', 10751: 'Family',
  14: 'Fantasy', 36: 'History', 27: 'Horror', 10402: 'Music',
  9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi', 10770: 'TV Movie',
  53: 'Thriller', 10752: 'War', 37: 'Western',
  10759: 'Action & Adventure', 10762: 'Kids', 10763: 'News',
  10764: 'Reality', 10765: 'Sci-Fi & Fantasy', 10766: 'Soap',
  10767: 'Talk', 10768: 'War & Politics',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mediaTitle(item: MediaItem): string {
  return item.media_type === 'movie'
    ? (item as Movie).title
    : (item as TVShow).name
}

function watchHref(item: MediaItem): string {
  if (item.media_type === 'tv') return `/watch/tv/${item.id}?s=1&e=1`
  return `/watch/movie/${item.id}`
}

function detailHref(item: MediaItem): string {
  return `/${item.media_type}/${item.id}`
}

function mediaYear(item: MediaItem): string {
  const movie = item as Movie
  const tv = item as TVShow
  const date = movie.release_date || tv.first_air_date || ''
  return date.slice(0, 4)
}

function genreNames(ids: number[], max = 3): string[] {
  return ids
    .slice(0, max)
    .map((id) => GENRE_MAP[id])
    .filter(Boolean)
}

// ─── SectionHeader ────────────────────────────────────────────────────────────

function SectionHeader({ title, href }: { title: string; href?: string }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <h2 className="section-heading whitespace-nowrap">{title}</h2>
      <div className="hairline flex-1" />
      {href && (
        <Link
          href={href}
          className="label-small text-muted hover:text-white transition-colors"
          style={{ color: 'rgba(255,255,255,0.25)' }}
        >
          See all
        </Link>
      )}
    </div>
  )
}

// ─── Poster card (shared) ──────────────────────────────────────────────────────

interface PosterCardProps {
  item: MediaItem
  rank?: number
  badge?: string
  progressPct?: number
  width?: number
  height?: number
}

function PosterCard({
  item,
  rank,
  badge,
  progressPct,
  width = 130,
  height = 190,
}: PosterCardProps) {
  const [imgLoaded, setImgLoaded] = useState(false)
  const title = mediaTitle(item)

  return (
    <Link
      href={watchHref(item)}
      className="shrink-0 group relative card-media cursor-pointer block"
      style={{ width, height, flexShrink: 0 }}
      aria-label={`Watch ${title}`}
    >
      {/* Rank watermark */}
      {rank !== undefined && (
        <span
          className="absolute top-2 left-3 z-0 select-none"
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontWeight: 900,
            fontSize: '28px',
            color: 'rgba(255,255,255,0.06)',
            lineHeight: 1,
          }}
          aria-hidden="true"
        >
          {rank}
        </span>
      )}

      {/* Poster image */}
      {item.poster_path ? (
        <Image
          src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
          alt={title}
          fill
          sizes={`${width}px`}
          className={`object-cover img-reveal${imgLoaded ? ' loaded' : ''}`}
          onLoad={() => setImgLoaded(true)}
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(135deg, rgba(229,9,20,0.08), rgba(3,3,5,0.9))',
          }}
        />
      )}

      {/* "NEW" badge */}
      {badge && (
        <span
          className="absolute top-2 left-2 label-small z-10 px-2 py-1 rounded"
          style={{ background: 'var(--red)', color: '#fff' }}
        >
          {badge}
        </span>
      )}

      {/* Hover overlay */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background:
            'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)',
        }}
      />

      {/* Hover content */}
      <div className="absolute inset-x-0 bottom-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
        {/* Red play button */}
        <div className="flex items-end justify-between gap-1">
          <p
            className="truncate"
            style={{
              fontFamily: "'Instrument Sans', sans-serif",
              fontWeight: 700,
              fontSize: '12px',
              color: '#fff',
              lineHeight: 1.3,
              flex: 1,
            }}
          >
            {title}
          </p>
          <div
            className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center scale-0 group-hover:scale-100 transition-transform duration-200"
            style={{ background: 'var(--red)' }}
          >
            <Play size={12} fill="white" color="white" />
          </div>
        </div>
        <p
          style={{
            fontFamily: "'Instrument Sans', sans-serif",
            fontSize: '10px',
            color: 'rgba(255,255,255,0.6)',
            marginTop: '2px',
          }}
        >
          {item.vote_average?.toFixed(1) ?? '—'} · {mediaYear(item)}
        </p>
      </div>

      {/* Progress bar */}
      {progressPct !== undefined && (
        <div
          className="absolute bottom-0 inset-x-0 z-20"
          style={{ height: '3px', background: 'rgba(255,255,255,0.1)' }}
        >
          <div
            style={{
              width: `${Math.min(progressPct, 100)}%`,
              height: '100%',
              background: 'var(--red)',
            }}
          />
        </div>
      )}

      {/* Border highlight on hover */}
      <div
        className="absolute inset-0 rounded-[14px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ border: '1px solid rgba(229,9,20,0.25)' }}
      />
    </Link>
  )
}

// ─── Carousel Section ─────────────────────────────────────────────────────────

interface CarouselSectionProps {
  title: string
  items: MediaItem[]
  loading: boolean
  href?: string
  badge?: string
  progressMap?: Record<number, number>
  skeletonCount?: number
  cardWidth?: number
  cardHeight?: number
}

function CarouselSection({
  title,
  items,
  loading,
  href,
  badge,
  progressMap,
  skeletonCount = 8,
  cardWidth = 130,
  cardHeight = 190,
}: CarouselSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = useCallback((dir: -1 | 1) => {
    scrollRef.current?.scrollBy({ left: dir * 300, behavior: 'smooth' })
  }, [])

  if (!loading && items.length === 0) return null

  return (
    <div className="reveal carousel-section relative pt-16">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <SectionHeader title={title} href={href} />
        <div className="relative">
          {/* Left arrow */}
          <button
            onClick={() => scroll(-1)}
            aria-label="Scroll left"
            className="carousel-arrow absolute left-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full flex items-center justify-center glass glass-blur"
            style={{ transform: 'translateY(-50%) translateX(-50%)' }}
          >
            <ChevronLeft size={16} />
          </button>

          {/* Cards */}
          <div
            ref={scrollRef}
            className="flex gap-3 overflow-x-auto scrollbar-hide pb-2"
          >
            {loading
              ? Array.from({ length: skeletonCount }).map((_, i) => (
                  <div
                    key={i}
                    className="skeleton shrink-0 rounded-[14px]"
                    style={{ width: cardWidth, height: cardHeight, flexShrink: 0 }}
                  />
                ))
              : items.map((item) => (
                  <PosterCard
                    key={item.id}
                    item={item}
                    badge={badge}
                    progressPct={progressMap?.[item.id]}
                    width={cardWidth}
                    height={cardHeight}
                  />
                ))}
          </div>

          {/* Right arrow */}
          <button
            onClick={() => scroll(1)}
            aria-label="Scroll right"
            className="carousel-arrow absolute right-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full flex items-center justify-center glass glass-blur"
            style={{ transform: 'translateY(-50%) translateX(50%)' }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  // Data state
  const [hero, setHero] = useState<MediaItem | null>(null)
  const [topMovies, setTopMovies] = useState<MediaItem[]>([])
  const [featuredCard, setFeaturedCard] = useState<MediaItem | null>(null)
  const [popularMovies, setPopularMovies] = useState<MediaItem[]>([])
  const [similarItems, setSimilarItems] = useState<MediaItem[]>([])
  const [newReleases, setNewReleases] = useState<MediaItem[]>([])
  const [loadingMain, setLoadingMain] = useState(true)
  const [loadingSimilar, setLoadingSimilar] = useState(false)
  const [fetchError, setFetchError] = useState(false)

  // Hero image loaded state
  const [heroImgLoaded, setHeroImgLoaded] = useState(false)
  const [featuredImgLoaded, setFeaturedImgLoaded] = useState(false)

  // Hero visibility for stagger animation
  const [heroVisible, setHeroVisible] = useState(false)

  // Watchlist
  const { isInWatchlist, addToWatchlist, removeFromWatchlist, history } =
    useWatchlist()

  // Scroll reveal observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add('visible')
        }),
      { threshold: 0.08 }
    )
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [loadingMain])

  // Hero entrance stagger
  useEffect(() => {
    const id = setTimeout(() => setHeroVisible(true), 100)
    return () => clearTimeout(id)
  }, [])

  // Initial parallel data fetching
  useEffect(() => {
    Promise.all([
      getTrending('tv', 'week'),
      getTrending('movie', 'week'),
      getPopular('movie'),
      getNowPlaying(),
    ])
      .then(([tvTrend, movieTrend, popularMoviesRes, nowPlayingRes]) => {
        // Hero: first trending TV item
        const heroItem = tvTrend.results[0]
          ? { ...(tvTrend.results[0] as TVShow), media_type: 'tv' as const }
          : null
        setHero(heroItem as MediaItem | null)

        // Top 5 this week from trending movies
        const top5 = movieTrend.results
          .slice(0, 5)
          .map((i) => ({ ...i, media_type: 'movie' as const })) as MediaItem[]
        setTopMovies(top5)

        // Featured card: 6th trending movie (distinct from top 5)
        const featured = movieTrend.results[5]
          ? ({
              ...(movieTrend.results[5] as Movie),
              media_type: 'movie' as const,
            } as MediaItem)
          : null
        setFeaturedCard(featured)

        // Popular movies carousel
        const pm = popularMoviesRes.results.map((i) => ({
          ...i,
          media_type: 'movie' as const,
        })) as MediaItem[]
        setPopularMovies(pm)

        // New releases from now playing
        const nr = nowPlayingRes.results.map((i) => ({
          ...i,
          media_type: 'movie' as const,
        })) as MediaItem[]
        setNewReleases(nr)
      })
      .catch(() => setFetchError(true))
      .finally(() => setLoadingMain(false))
  }, [])

  // Fetch similar items once hero is loaded
  useEffect(() => {
    if (!hero) return
    setLoadingSimilar(true)
    getSimilar('tv', hero.id)
      .then((res) => {
        const items = res.results
          .slice(0, 12)
          .map((i) => ({ ...i, media_type: 'tv' as const })) as MediaItem[]
        setSimilarItems(items)
      })
      .catch(() => {/* silently skip */})
      .finally(() => setLoadingSimilar(false))
  }, [hero])

  // Watchlist toggle for hero
  function toggleHeroWatchlist() {
    if (!hero) return
    const title = mediaTitle(hero)
    if (isInWatchlist(hero.id)) {
      removeFromWatchlist(hero.id)
    } else {
      addToWatchlist({
        id: hero.id,
        type: hero.media_type,
        title,
        poster_path: hero.poster_path,
        vote_average: hero.vote_average,
        addedAt: new Date().toISOString(),
      })
    }
  }

  // Continue watching: derive from history in WatchlistContext
  const continueItems: MediaItem[] = history.slice(0, 12).map((h) => ({
    id: h.id,
    media_type: h.type,
    ...(h.type === 'movie'
      ? { title: h.title }
      : { name: h.title }),
    poster_path: h.poster_path,
    backdrop_path: null,
    vote_average: 0,
    genre_ids: [],
    overview: '',
  })) as MediaItem[]

  // Because you watched: title from most recent history item
  const lastWatchedTitle =
    history.length > 0 ? history[0].title : null

  const heroInWatchlist = hero ? isInWatchlist(hero.id) : false

  // Hero meta helpers
  const heroTitle = hero ? mediaTitle(hero) : ''
  const heroYear = hero ? mediaYear(hero) : ''
  const heroGenres = hero
    ? genreNames(hero.genre_ids, 1)
    : []
  const heroRatingPct = hero
    ? Math.round((hero.vote_average / 10) * 100)
    : 0
  const heroOverview = hero
    ? (hero as TVShow | Movie).overview
    : ''
  const heroSeasons = hero
    ? (hero as TVShow).number_of_seasons
    : undefined
  const heroHref = hero ? watchHref(hero) : '#'
  const heroDetailHref = hero ? detailHref(hero) : '#'

  // Featured card helpers
  const featTitle = featuredCard ? mediaTitle(featuredCard) : ''
  const featGenres = featuredCard ? genreNames(featuredCard.genre_ids, 3) : []

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>

      {/* ── Fetch error banner ─────────────────────────────────────────── */}
      {fetchError && (
        <div
          role="alert"
          className="fixed bottom-6 left-1/2 z-50 glass glass-blur rounded-[12px] px-5 py-3"
          style={{ transform: 'translateX(-50%)', whiteSpace: 'nowrap' }}
        >
          <span
            style={{
              fontFamily: "'Instrument Sans', sans-serif",
              fontSize: '13px',
              color: 'rgba(255,255,255,0.8)',
            }}
          >
            Could not load content — check your connection and refresh.
          </span>
        </div>
      )}

      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <section className="pt-20 pb-16">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="flex flex-col lg:flex-row items-start gap-10 lg:gap-16">

            {/* Left column */}
            <div
              className={`hero-content flex-1 max-w-[520px] flex flex-col gap-5${heroVisible ? ' visible' : ''}`}
            >
              {/* [hero-el 1] Chips */}
              <div className="hero-el flex items-center flex-wrap gap-2">
                {/* Trending pill */}
                <span
                  className="label-small px-3 py-1.5 rounded-full"
                  style={{
                    background: 'rgba(229,9,20,0.12)',
                    border: '1px solid rgba(229,9,20,0.25)',
                    color: '#ff6b6b',
                  }}
                >
                  Trending #1
                </span>

                {/* Rating pill */}
                <span
                  className="label-small px-3 py-1.5 rounded-full glass"
                >
                  TV-MA
                </span>

                {/* Genre pill */}
                {heroGenres.length > 0 && (
                  <span className="label-small px-3 py-1.5 rounded-full glass">
                    {heroGenres[0]}
                  </span>
                )}
              </div>

              {/* [hero-el 2] Title */}
              <div className="hero-el">
                {loadingMain ? (
                  <div
                    className="skeleton rounded-lg"
                    style={{ height: '106px', maxWidth: '420px' }}
                  />
                ) : (
                  <h1
                    style={{
                      fontFamily: "'Playfair Display', Georgia, serif",
                      fontWeight: 900,
                      fontSize: 'clamp(32px, 5vw, 56px)',
                      letterSpacing: '-2px',
                      lineHeight: 0.92,
                      color: '#ffffff',
                      margin: 0,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {heroTitle || 'Loading…'}
                  </h1>
                )}
              </div>

              {/* [hero-el 3] Meta row */}
              <div
                className="hero-el flex items-center gap-2 flex-wrap"
                style={{
                  fontFamily: "'Instrument Sans', sans-serif",
                  fontSize: '12px',
                  color: 'rgba(255,255,255,0.35)',
                }}
              >
                {loadingMain ? (
                  <div className="skeleton rounded" style={{ width: '160px', height: '14px' }} />
                ) : (
                  <>
                    {/* Rating + mini bar */}
                    <span className="flex items-center gap-1.5">
                      {hero?.vote_average?.toFixed(1) ?? '—'}
                      <span
                        className="rounded-full overflow-hidden"
                        style={{
                          width: '40px',
                          height: '4px',
                          background: 'rgba(255,255,255,0.08)',
                        }}
                      >
                        <span
                          className="block h-full rounded-full"
                          style={{
                            width: `${heroRatingPct}%`,
                            background: '#46d369',
                          }}
                        />
                      </span>
                    </span>

                    <span
                      className="rounded-full"
                      style={{
                        width: '3px',
                        height: '3px',
                        background: 'rgba(255,255,255,0.3)',
                        display: 'inline-block',
                      }}
                    />

                    {/* Year */}
                    <span>{heroYear}</span>

                    <span
                      className="rounded-full"
                      style={{
                        width: '3px',
                        height: '3px',
                        background: 'rgba(255,255,255,0.3)',
                        display: 'inline-block',
                      }}
                    />

                    {/* Seasons info */}
                    <span>
                      {heroSeasons
                        ? `${heroSeasons} Season${heroSeasons !== 1 ? 's' : ''}`
                        : 'Series'}
                    </span>
                  </>
                )}
              </div>

              {/* [hero-el 4] Overview */}
              <div className="hero-el">
                {loadingMain ? (
                  <div className="flex flex-col gap-2">
                    <div className="skeleton rounded" style={{ height: '14px', maxWidth: '380px' }} />
                    <div className="skeleton rounded" style={{ height: '14px', maxWidth: '300px' }} />
                  </div>
                ) : (
                  <p
                    style={{
                      fontFamily: "'Instrument Sans', sans-serif",
                      fontSize: '14px',
                      lineHeight: 1.8,
                      color: 'rgba(255,255,255,0.3)',
                      maxWidth: '440px',
                      margin: 0,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {heroOverview}
                  </p>
                )}
              </div>

              {/* [hero-el 5] Buttons */}
              <div className="hero-el flex items-center gap-3 flex-wrap">
                <Link href={heroHref} className="btn-watch" aria-label={`Watch ${heroTitle}`}>
                  <Play size={16} fill="currentColor" />
                  Watch now
                </Link>

                <button
                  className="btn-list"
                  onClick={toggleHeroWatchlist}
                  aria-label={heroInWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
                >
                  <Heart
                    size={16}
                    fill={heroInWatchlist ? 'currentColor' : 'none'}
                  />
                  {heroInWatchlist ? 'Saved' : 'Watchlist'}
                </button>

                {/* Share */}
                <button
                  aria-label="Share"
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({ title: heroTitle, url: heroDetailHref })
                    } else if (navigator.clipboard) {
                      navigator.clipboard.writeText(
                        `${window.location.origin}${heroDetailHref}`
                      )
                    }
                  }}
                  className="flex items-center justify-center rounded-full glass"
                  style={{ width: '44px', height: '44px', flexShrink: 0 }}
                >
                  <Share2 size={16} />
                </button>
              </div>
            </div>

            {/* Right col: Featured glass card (lg+) */}
            <div className="hidden lg:block" style={{ width: '380px', flexShrink: 0 }}>
              {loadingMain ? (
                <div
                  className="skeleton rounded-[20px]"
                  style={{ height: '420px', width: '380px' }}
                />
              ) : featuredCard ? (
                <div
                  className="glass glass-blur overflow-hidden relative"
                  style={{ borderRadius: '20px' }}
                >
                  {/* Featured image */}
                  <div className="relative w-full" style={{ height: '220px' }}>
                    {featuredCard.poster_path ? (
                      <Image
                        src={`https://image.tmdb.org/t/p/w500${featuredCard.poster_path}`}
                        alt={featTitle}
                        fill
                        sizes="380px"
                        className={`object-cover img-reveal${featuredImgLoaded ? ' loaded' : ''}`}
                        onLoad={() => setFeaturedImgLoaded(true)}
                      />
                    ) : (
                      <div
                        className="absolute inset-0"
                        style={{
                          background:
                            'linear-gradient(135deg, rgba(229,9,20,0.08), rgba(3,3,5,0.95))',
                        }}
                      />
                    )}

                    {/* Featured badge */}
                    <span
                      className="absolute top-3 left-3 label-small px-3 py-1.5 rounded-lg glass glass-blur z-10"
                      style={{ color: 'rgba(255,255,255,0.7)' }}
                    >
                      Featured
                    </span>
                  </div>

                  {/* Card body */}
                  <div className="p-4 flex flex-col gap-2">
                    {/* Title */}
                    <p
                      className="truncate"
                      style={{
                        fontFamily: "'Instrument Sans', sans-serif",
                        fontWeight: 700,
                        fontSize: '18px',
                        color: '#fff',
                        lineHeight: 1.3,
                      }}
                    >
                      {featTitle}
                    </p>

                    {/* Rating badge */}
                    <span
                      className="label-small px-2 py-1 rounded-full w-fit"
                      style={{
                        background: 'rgba(70,211,105,0.12)',
                        border: '1px solid rgba(70,211,105,0.25)',
                        color: '#46d369',
                      }}
                    >
                      {featuredCard.vote_average?.toFixed(1) ?? '—'} ★
                    </span>

                    {/* Genre tags */}
                    {featGenres.length > 0 && (
                      <div className="flex gap-1 flex-wrap">
                        {featGenres.map((g) => (
                          <span
                            key={g}
                            className="label-small px-2 py-1 rounded-full glass"
                            style={{ color: 'rgba(255,255,255,0.5)' }}
                          >
                            {g}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Overview */}
                    <p
                      style={{
                        fontFamily: "'Instrument Sans', sans-serif",
                        fontSize: '13px',
                        color: 'rgba(255,255,255,0.3)',
                        lineHeight: 1.7,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {(featuredCard as Movie).overview}
                    </p>

                    {/* CTA buttons */}
                    <div className="flex gap-2 mt-1">
                      <Link
                        href={watchHref(featuredCard)}
                        className="btn-watch flex-1 justify-center"
                        style={{ padding: '8px 16px', fontSize: '12px' }}
                      >
                        <Play size={13} fill="currentColor" />
                        Watch
                      </Link>
                      <button
                        className="btn-list flex-1 justify-center"
                        style={{ padding: '8px 16px', fontSize: '12px' }}
                        aria-label={isInWatchlist(featuredCard.id) ? `Remove ${featTitle} from watchlist` : `Add ${featTitle} to watchlist`}
                        onClick={() => {
                          if (isInWatchlist(featuredCard.id)) {
                            removeFromWatchlist(featuredCard.id)
                          } else {
                            addToWatchlist({
                              id: featuredCard.id,
                              type: featuredCard.media_type,
                              title: featTitle,
                              poster_path: featuredCard.poster_path,
                              vote_average: featuredCard.vote_average,
                              addedAt: new Date().toISOString(),
                            })
                          }
                        }}
                      >
                        {isInWatchlist(featuredCard.id) ? '✓ Saved' : '+ List'}
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {/* Backdrop ambient behind hero */}
      {hero?.backdrop_path && (
        <div
          aria-hidden="true"
          className="fixed inset-0 pointer-events-none"
          style={{ zIndex: -1 }}
        >
          <Image
            src={`https://image.tmdb.org/t/p/w1280${hero.backdrop_path}`}
            alt=""
            fill
            sizes="100vw"
            className={`object-cover img-reveal${heroImgLoaded ? ' loaded' : ''}`}
            onLoad={() => setHeroImgLoaded(true)}
            priority
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(to right, #030305 40%, rgba(3,3,5,0.85) 70%, rgba(3,3,5,0.6) 100%), linear-gradient(to top, #030305 0%, transparent 50%)',
            }}
          />
        </div>
      )}

      {/* ── TOP 5 THIS WEEK ───────────────────────────────────────────── */}
      <div className="reveal pt-16">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <SectionHeader title="Top 5 This Week" href="/browse/movies" />

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {loadingMain
              ? Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="skeleton rounded-[14px]"
                    style={{ height: '170px' }}
                  />
                ))
              : topMovies.length === 0
              ? (
                  <div
                    className="col-span-5 flex items-center justify-center"
                    style={{ height: '170px', color: 'rgba(255,255,255,0.2)', fontFamily: "'Instrument Sans', sans-serif", fontSize: '13px' }}
                  >
                    No trending titles available
                  </div>
                )
              : topMovies.map((item, i) => (
                  <Link
                    key={item.id}
                    href={watchHref(item)}
                    className="group relative card-media cursor-pointer block overflow-hidden"
                    style={{ height: '170px' }}
                    aria-label={`Watch ${mediaTitle(item)}`}
                  >
                    {/* Rank watermark */}
                    <span
                      className="absolute top-2 left-3 z-0 select-none"
                      style={{
                        fontFamily: "'Playfair Display', Georgia, serif",
                        fontWeight: 900,
                        fontSize: '28px',
                        color: 'rgba(255,255,255,0.06)',
                        lineHeight: 1,
                      }}
                      aria-hidden="true"
                    >
                      {i + 1}
                    </span>

                    {/* Poster */}
                    {item.poster_path ? (
                      <Image
                        src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                        alt={mediaTitle(item)}
                        fill
                        sizes="(max-width: 1400px) 20vw, 280px"
                        className="object-cover img-reveal loaded"
                      />
                    ) : (
                      <div
                        className="absolute inset-0"
                        style={{
                          background:
                            'linear-gradient(135deg, rgba(229,9,20,0.08), rgba(3,3,5,0.9))',
                        }}
                      />
                    )}

                    {/* Hover overlay gradient */}
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{
                        background:
                          'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)',
                      }}
                    />

                    {/* Hover: title + rating */}
                    <div className="absolute inset-x-0 bottom-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                      <p
                        className="truncate"
                        style={{
                          fontFamily: "'Instrument Sans', sans-serif",
                          fontWeight: 700,
                          fontSize: '12px',
                          color: '#fff',
                        }}
                      >
                        {mediaTitle(item)}
                      </p>
                      <p
                        style={{
                          fontFamily: "'Instrument Sans', sans-serif",
                          fontSize: '10px',
                          color: 'rgba(255,255,255,0.6)',
                          marginTop: '2px',
                        }}
                      >
                        {item.vote_average?.toFixed(1) ?? '—'} · {mediaYear(item)}
                      </p>
                    </div>

                    {/* Red play button bottom-right */}
                    <div
                      className="absolute bottom-3 right-3 w-8 h-8 rounded-full flex items-center justify-center scale-0 group-hover:scale-100 transition-transform duration-200 z-10"
                      style={{ background: 'var(--red)' }}
                    >
                      <Play size={12} fill="white" color="white" />
                    </div>

                    {/* Border highlight on hover */}
                    <div
                      className="absolute inset-0 rounded-[14px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{ border: '1px solid rgba(229,9,20,0.25)' }}
                    />
                  </Link>
                ))}
          </div>
        </div>
      </div>

      {/* ── CONTINUE WATCHING ─────────────────────────────────────────── */}
      {continueItems.length > 0 && (
        <CarouselSection
          title="Continue Watching"
          items={continueItems}
          loading={false}
          cardWidth={160}
          cardHeight={90}
        />
      )}

      {/* ── BECAUSE YOU WATCHED ───────────────────────────────────────── */}
      {(similarItems.length > 0 || loadingSimilar) && (
        <CarouselSection
          title={
            lastWatchedTitle
              ? `Because you watched ${lastWatchedTitle}`
              : 'You Might Also Like'
          }
          items={similarItems}
          loading={loadingSimilar}
          href="/browse/tv"
          skeletonCount={8}
        />
      )}

      {/* ── NEW RELEASES ──────────────────────────────────────────────── */}
      <CarouselSection
        title="New Releases"
        items={newReleases}
        loading={loadingMain}
        href="/browse/movies"
        badge="NEW"
        skeletonCount={8}
      />

      {/* ── POPULAR MOVIES ────────────────────────────────────────────── */}
      <CarouselSection
        title="Popular Movies"
        items={popularMovies}
        loading={loadingMain}
        href="/browse/movies"
        skeletonCount={10}
      />

      {/* Bottom padding */}
      <div style={{ paddingBottom: '80px' }} />
    </div>
  )
}
