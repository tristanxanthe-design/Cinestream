'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Play, Plus, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { getTrending, getPopular, getTopRated } from '@/lib/tmdb'
import type { Movie, TVShow, MediaItem } from '@/lib/types'
import { useWatchlist } from '@/context/WatchlistContext'

// ─── Constants ────────────────────────────────────────────────────────────────

const IMG = 'https://image.tmdb.org/t/p/'

const GENRE_MAP: Record<number, string> = {
  28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy',
  80: 'Crime', 99: 'Documentary', 18: 'Drama', 10751: 'Family',
  14: 'Fantasy', 36: 'History', 27: 'Horror', 10402: 'Music',
  9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi', 10770: 'TV Movie',
  53: 'Thriller', 10752: 'War', 37: 'Western',
  10759: 'Action & Adventure', 10762: 'Kids', 10765: 'Sci-Fi & Fantasy',
}

const GENRES = [
  { id: 28,    name: 'Action'    },
  { id: 35,    name: 'Comedy'    },
  { id: 18,    name: 'Drama'     },
  { id: 27,    name: 'Horror'    },
  { id: 878,   name: 'Sci-Fi'    },
  { id: 10749, name: 'Romance'   },
  { id: 16,    name: 'Animation' },
  { id: 53,    name: 'Thriller'  },
  { id: 12,    name: 'Adventure' },
  { id: 80,    name: 'Crime'     },
  { id: 14,    name: 'Fantasy'   },
  { id: 10751, name: 'Family'    },
]

const TABS = ['Movies', 'TV Shows', 'Anime'] as const
type Tab = typeof TABS[number]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mediaTitle(item: MediaItem): string {
  return item.media_type === 'movie'
    ? (item as Movie).title
    : (item as TVShow).name
}

function getWatchHref(item: MediaItem): string {
  if (item.media_type === 'tv') return `/watch/tv/${item.id}?s=1&e=1`
  return `/watch/movie/${item.id}`
}

function getWatchHrefByType(id: number, type: 'movie' | 'tv'): string {
  if (type === 'tv') return `/watch/tv/${id}?s=1&e=1`
  return `/watch/movie/${id}`
}

function genreNames(ids: number[], max = 2): string[] {
  return ids.slice(0, max).map(id => GENRE_MAP[id]).filter(Boolean)
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const router = useRouter()
  const { watchlist, addToWatchlist, isInWatchlist } = useWatchlist()

  const [activeTab, setActiveTab] = useState<Tab>('Movies')
  const [bannerIdx, setBannerIdx] = useState(0)
  const [bannerItems, setBannerItems] = useState<MediaItem[]>([])
  const [popularItems, setPopularItems] = useState<MediaItem[]>([])
  const [topRatedItems, setTopRatedItems] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // ─── Data fetch ─────────────────────────────────────────────────────────────

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    const mediaType = activeTab === 'TV Shows' ? 'tv' : 'movie'

    Promise.all([
      getTrending(mediaType, 'week'),
      getPopular(mediaType),
      getTopRated(mediaType),
    ])
      .then(([trending, popular, topRated]) => {
        if (cancelled) return
        setBannerItems(trending.results.slice(0, 5) as MediaItem[])
        setPopularItems(popular.results.slice(0, 6) as MediaItem[])
        setTopRatedItems(topRated.results.slice(0, 5) as MediaItem[])
        setBannerIdx(0)
      })
      .catch(() => {
        if (!cancelled) setError('Failed to load content. Please try again.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [activeTab])

  // ─── Banner auto-rotate ─────────────────────────────────────────────────────

  useEffect(() => {
    if (bannerItems.length === 0) return
    const timer = setInterval(() => {
      setBannerIdx(i => (i + 1) % Math.min(bannerItems.length, 5))
    }, 6000)
    return () => clearInterval(timer)
  }, [bannerItems])

  const prevBanner = useCallback(() => {
    setBannerIdx(i => (i - 1 + Math.min(bannerItems.length, 5)) % Math.min(bannerItems.length, 5))
  }, [bannerItems.length])

  const nextBanner = useCallback(() => {
    setBannerIdx(i => (i + 1) % Math.min(bannerItems.length, 5))
  }, [bannerItems.length])

  // ─── Derived banner item ────────────────────────────────────────────────────

  const bannerItem = bannerItems[bannerIdx]
  const bannerBackdrop = bannerItem?.backdrop_path
    ? `${IMG}w1280${bannerItem.backdrop_path}`
    : null
  const bannerTitle = bannerItem ? mediaTitle(bannerItem) : ''
  const bannerGenres = bannerItem ? genreNames(bannerItem.genre_ids) : []
  const bannerHref = bannerItem ? getWatchHref(bannerItem) : '#'

  // ─── Continue watching from watchlist ──────────────────────────────────────
  // Use the last 3 watchlist items as a proxy for "continue watching"
  const continueItems = watchlist.slice(0, 3)

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="p-4 md:p-6 lg:p-8" style={{ fontFamily: 'Outfit, sans-serif' }}>

      {/* ── TOP BAR ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">

        {/* Content-type tabs */}
        <div
          className="flex gap-1 p-1 rounded-full"
          style={{ background: 'rgba(255,255,255,0.03)' }}
        >
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-4 py-1.5 rounded-full text-sm font-medium transition-all"
              style={{
                fontFamily: 'Outfit, sans-serif',
                background: activeTab === tab ? '#e50914' : 'transparent',
                color: activeTab === tab ? '#fff' : 'rgba(255,255,255,0.4)',
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-3">
          {/* Search pill */}
          <div
            className="flex items-center gap-2 rounded-full px-4 py-2 cursor-pointer transition-colors"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              minWidth: 180,
            }}
            onClick={() => router.push('/search')}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
          >
            <Search size={14} style={{ color: 'rgba(255,255,255,0.4)', flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', fontFamily: 'Outfit, sans-serif' }}>
              Search...
            </span>
          </div>

          {/* User avatar */}
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 select-none"
            style={{
              background: 'linear-gradient(135deg, #e50914, #ff4d58)',
              fontFamily: 'Outfit, sans-serif',
            }}
          >
            X
          </div>
        </div>
      </div>

      {/* ── MAIN 2-COL LAYOUT ───────────────────────────────────────────────── */}
      <div className="flex gap-6">

        {/* ── CENTER COLUMN ─────────────────────────────────────────────────── */}
        <div className="flex-1 min-w-0">

          {/* Error state */}
          {error && (
            <div
              className="rounded-[14px] p-4 mb-6 text-sm"
              style={{
                background: 'rgba(229,9,20,0.08)',
                border: '1px solid rgba(229,9,20,0.2)',
                color: 'rgba(255,255,255,0.7)',
                fontFamily: 'Outfit, sans-serif',
              }}
            >
              {error}
            </div>
          )}

          {/* ── HERO BANNER ───────────────────────────────────────────────── */}
          {loading ? (
            <div className="skeleton h-[280px] rounded-[16px] mb-6" />
          ) : bannerItem ? (
            <div className="relative h-[280px] rounded-[16px] overflow-hidden mb-6">
              {/* Backdrop image */}
              {bannerBackdrop ? (
                <Image
                  fill
                  priority
                  src={bannerBackdrop}
                  alt={bannerTitle}
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, calc(100vw - 500px)"
                />
              ) : (
                <div
                  className="absolute inset-0"
                  style={{ background: 'linear-gradient(135deg, rgba(229,9,20,0.15), rgba(12,12,20,0.9))' }}
                />
              )}

              {/* Gradient overlays */}
              <div
                className="absolute inset-0"
                style={{ background: 'linear-gradient(to right, rgba(12,12,20,0.95) 30%, transparent)' }}
              />
              <div
                className="absolute inset-0"
                style={{ background: 'linear-gradient(to top, rgba(12,12,20,0.8) 0%, transparent 50%)' }}
              />

              {/* Banner content */}
              <div className="absolute inset-0 p-6 flex flex-col justify-end">
                {/* Genre pills */}
                {bannerGenres.length > 0 && (
                  <div className="flex gap-2 mb-3">
                    {bannerGenres.map(g => (
                      <span
                        key={g}
                        className="text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full"
                        style={{
                          background: 'rgba(255,255,255,0.1)',
                          color: 'rgba(255,255,255,0.7)',
                          fontFamily: 'Outfit, sans-serif',
                        }}
                      >
                        {g}
                      </span>
                    ))}
                  </div>
                )}

                {/* Title */}
                <h1
                  className="text-white mb-3 max-w-[400px]"
                  style={{
                    fontSize: 'clamp(20px, 3vw, 32px)',
                    fontWeight: 800,
                    lineHeight: 1.1,
                    fontFamily: 'Outfit, sans-serif',
                  }}
                >
                  {bannerTitle}
                </h1>

                {/* CTA buttons */}
                <div className="flex gap-2">
                  <button
                    className="btn-ghost"
                    onClick={() => {
                      if (bannerItem && !isInWatchlist(bannerItem.id)) {
                        addToWatchlist({
                          id: bannerItem.id,
                          type: bannerItem.media_type as 'movie' | 'tv',
                          title: bannerTitle,
                          poster_path: bannerItem.poster_path,
                          vote_average: bannerItem.vote_average,
                          addedAt: new Date().toISOString(),
                        })
                      }
                    }}
                  >
                    <Plus size={14} />
                    {bannerItem && isInWatchlist(bannerItem.id) ? 'Saved' : 'Watchlist'}
                  </button>
                  <Link href={bannerHref}>
                    <button className="btn-red">
                      <Play size={14} />
                      Watch Now
                    </button>
                  </Link>
                </div>
              </div>

              {/* Nav arrows */}
              <button
                onClick={prevBanner}
                aria-label="Previous"
                className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm transition-colors"
                style={{ background: 'rgba(0,0,0,0.4)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.65)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.4)')}
              >
                <ChevronLeft size={16} color="#fff" />
              </button>
              <button
                onClick={nextBanner}
                aria-label="Next"
                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm transition-colors"
                style={{ background: 'rgba(0,0,0,0.4)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.65)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.4)')}
              >
                <ChevronRight size={16} color="#fff" />
              </button>

              {/* Dot indicators */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {bannerItems.slice(0, 5).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setBannerIdx(i)}
                    aria-label={`Slide ${i + 1}`}
                    className="h-1.5 rounded-full transition-all"
                    style={{
                      width: i === bannerIdx ? '20px' : '6px',
                      background: i === bannerIdx ? '#e50914' : 'rgba(255,255,255,0.3)',
                    }}
                  />
                ))}
              </div>
            </div>
          ) : null}

          {/* ── POPULAR SECTION ───────────────────────────────────────────── */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2
                className="text-white"
                style={{ fontSize: 16, fontWeight: 700, fontFamily: 'Outfit, sans-serif' }}
              >
                Popular on CineStream
              </h2>
              <Link
                href="/browse/movies"
                style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontFamily: 'Outfit, sans-serif' }}
              >
                See all
              </Link>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map(n => (
                  <div key={n} className="skeleton h-[200px] rounded-[14px]" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
                {popularItems.slice(0, 3).map(item => {
                  const title = mediaTitle(item)
                  const backdrop = item.backdrop_path
                    ? `${IMG}w780${item.backdrop_path}`
                    : item.poster_path
                      ? `${IMG}w300${item.poster_path}`
                      : null
                  const href = getWatchHref(item)
                  const stars = Math.round(item.vote_average / 2)

                  return (
                    <div
                      key={item.id}
                      className="card fade-in relative overflow-hidden cursor-pointer"
                      style={{ height: 200 }}
                    >
                      {backdrop ? (
                        <Image
                          fill
                          src={backdrop}
                          alt={title}
                          className="object-cover"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      ) : (
                        <div
                          className="absolute inset-0"
                          style={{ background: 'linear-gradient(135deg, rgba(229,9,20,0.12), rgba(12,12,20,0.9))' }}
                        />
                      )}

                      {/* Bottom gradient */}
                      <div
                        className="absolute inset-0"
                        style={{ background: 'linear-gradient(to top, rgba(12,12,20,0.95) 0%, transparent 60%)' }}
                      />

                      {/* Card content */}
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <p
                          className="text-white line-clamp-1"
                          style={{ fontWeight: 700, fontSize: 14, fontFamily: 'Outfit, sans-serif' }}
                        >
                          {title}
                        </p>

                        {/* Star rating */}
                        <div className="flex items-center gap-1 mt-1">
                          {[1, 2, 3, 4, 5].map(s => (
                            <span
                              key={s}
                              style={{
                                color: s <= stars ? '#f5c518' : 'rgba(255,255,255,0.2)',
                                fontSize: 10,
                              }}
                            >
                              ★
                            </span>
                          ))}
                          <span
                            style={{
                              fontSize: 11,
                              color: 'rgba(255,255,255,0.4)',
                              marginLeft: 4,
                              fontFamily: 'Outfit, sans-serif',
                            }}
                          >
                            {item.vote_average.toFixed(1)}
                          </span>
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-1 mt-2">
                          <button
                            className="btn-ghost"
                            style={{ padding: '4px 10px', fontSize: 11 }}
                            onClick={() => {
                              if (!isInWatchlist(item.id)) {
                                addToWatchlist({
                                  id: item.id,
                                  type: item.media_type as 'movie' | 'tv',
                                  title,
                                  poster_path: item.poster_path,
                                  vote_average: item.vote_average,
                                  addedAt: new Date().toISOString(),
                                })
                              }
                            }}
                          >
                            {isInWatchlist(item.id) ? '✓' : '+'}
                          </button>
                          <Link href={href}>
                            <button className="btn-red" style={{ padding: '4px 10px', fontSize: 11 }}>
                              Watch
                            </button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* ── MORE POPULAR (rows 2+) ─────────────────────────────────────── */}
          {!loading && popularItems.length > 3 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2
                  className="text-white"
                  style={{ fontSize: 16, fontWeight: 700, fontFamily: 'Outfit, sans-serif' }}
                >
                  Trending This Week
                </h2>
                <Link
                  href={activeTab === 'TV Shows' ? '/browse/tv' : '/browse/movies'}
                  style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontFamily: 'Outfit, sans-serif' }}
                >
                  See all
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
                {popularItems.slice(3, 6).map(item => {
                  const title = mediaTitle(item)
                  const backdrop = item.backdrop_path
                    ? `${IMG}w780${item.backdrop_path}`
                    : item.poster_path
                      ? `${IMG}w300${item.poster_path}`
                      : null
                  const href = getWatchHref(item)
                  const stars = Math.round(item.vote_average / 2)

                  return (
                    <div
                      key={item.id}
                      className="card fade-in relative overflow-hidden cursor-pointer"
                      style={{ height: 200 }}
                    >
                      {backdrop ? (
                        <Image
                          fill
                          src={backdrop}
                          alt={title}
                          className="object-cover"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      ) : (
                        <div
                          className="absolute inset-0"
                          style={{ background: 'linear-gradient(135deg, rgba(229,9,20,0.12), rgba(12,12,20,0.9))' }}
                        />
                      )}
                      <div
                        className="absolute inset-0"
                        style={{ background: 'linear-gradient(to top, rgba(12,12,20,0.95) 0%, transparent 60%)' }}
                      />
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <p
                          className="text-white line-clamp-1"
                          style={{ fontWeight: 700, fontSize: 14, fontFamily: 'Outfit, sans-serif' }}
                        >
                          {title}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          {[1, 2, 3, 4, 5].map(s => (
                            <span
                              key={s}
                              style={{
                                color: s <= stars ? '#f5c518' : 'rgba(255,255,255,0.2)',
                                fontSize: 10,
                              }}
                            >
                              ★
                            </span>
                          ))}
                          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginLeft: 4, fontFamily: 'Outfit, sans-serif' }}>
                            {item.vote_average.toFixed(1)}
                          </span>
                        </div>
                        <div className="flex gap-1 mt-2">
                          <button
                            className="btn-ghost"
                            style={{ padding: '4px 10px', fontSize: 11 }}
                            onClick={() => {
                              if (!isInWatchlist(item.id)) {
                                addToWatchlist({
                                  id: item.id,
                                  type: item.media_type as 'movie' | 'tv',
                                  title,
                                  poster_path: item.poster_path,
                                  vote_average: item.vote_average,
                                  addedAt: new Date().toISOString(),
                                })
                              }
                            }}
                          >
                            {isInWatchlist(item.id) ? '✓' : '+'}
                          </button>
                          <Link href={href}>
                            <button className="btn-red" style={{ padding: '4px 10px', fontSize: 11 }}>
                              Watch
                            </button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT COLUMN ──────────────────────────────────────────────────── */}
        <aside
          className="hidden lg:block flex-shrink-0"
          style={{ width: 260 }}
        >

          {/* ── CONTINUE WATCHING ─────────────────────────────────────────── */}
          <div
            className="rounded-[14px] p-4 mb-4"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.05)',
            }}
          >
            <h3
              className="text-white mb-3"
              style={{ fontSize: 13, fontWeight: 700, fontFamily: 'Outfit, sans-serif' }}
            >
              Continue Watching
            </h3>

            {continueItems.length === 0 ? (
              <p
                style={{
                  fontSize: 12,
                  color: 'rgba(255,255,255,0.3)',
                  fontFamily: 'Outfit, sans-serif',
                  padding: '8px 0',
                }}
              >
                Nothing saved yet — add titles to your watchlist to see them here.
              </p>
            ) : (
              <div className="flex flex-col gap-1">
                {continueItems.map(item => {
                  const posterSrc = item.poster_path
                    ? `${IMG}w92${item.poster_path}`
                    : null
                  const href = getWatchHrefByType(item.id, item.type)

                  return (
                    <div
                      key={item.id}
                      className="flex gap-3 p-3 rounded-[10px] transition-colors cursor-pointer"
                      style={{ background: 'transparent' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <div
                        className="rounded-[8px] overflow-hidden flex-shrink-0"
                        style={{ width: 44, height: 44 }}
                      >
                        {posterSrc ? (
                          <Image
                            width={44}
                            height={44}
                            src={posterSrc}
                            alt={item.title}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div
                            className="w-full h-full"
                            style={{ background: 'rgba(229,9,20,0.15)' }}
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <p
                          className="text-white line-clamp-1"
                          style={{ fontWeight: 600, fontSize: 13, fontFamily: 'Outfit, sans-serif' }}
                        >
                          {item.title}
                        </p>
                        <p
                          style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontFamily: 'Outfit, sans-serif' }}
                        >
                          Continue watching
                        </p>
                      </div>
                      <div className="flex items-center flex-shrink-0">
                        <Link href={href}>
                          <button className="btn-red" style={{ padding: '4px 10px', fontSize: 11 }}>
                            Watch
                          </button>
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* ── TOP RATED ─────────────────────────────────────────────────── */}
          <div
            className="rounded-[14px] p-4 mb-4"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.05)',
            }}
          >
            <h3
              className="text-white mb-3"
              style={{ fontSize: 13, fontWeight: 700, fontFamily: 'Outfit, sans-serif' }}
            >
              Top Rated
            </h3>

            {loading ? (
              <div className="flex flex-col gap-2">
                {[1, 2, 3].map(n => <div key={n} className="skeleton h-[60px] rounded-[10px]" />)}
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                {topRatedItems.slice(0, 3).map(item => {
                  const title = mediaTitle(item)
                  const posterSrc = item.poster_path
                    ? `${IMG}w92${item.poster_path}`
                    : null
                  const href = getWatchHref(item)

                  return (
                    <div
                      key={item.id}
                      className="flex gap-3 p-3 rounded-[10px] transition-colors cursor-pointer"
                      style={{ background: 'transparent' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <div
                        className="rounded-[8px] overflow-hidden flex-shrink-0"
                        style={{ width: 44, height: 44 }}
                      >
                        {posterSrc ? (
                          <Image
                            width={44}
                            height={44}
                            src={posterSrc}
                            alt={title}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div
                            className="w-full h-full"
                            style={{ background: 'rgba(229,9,20,0.15)' }}
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <p
                          className="text-white line-clamp-1"
                          style={{ fontWeight: 600, fontSize: 13, fontFamily: 'Outfit, sans-serif' }}
                        >
                          {title}
                        </p>
                        <p
                          style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontFamily: 'Outfit, sans-serif' }}
                        >
                          {item.vote_average.toFixed(1)} / 10
                        </p>
                      </div>
                      <div className="flex items-center flex-shrink-0">
                        <Link href={href}>
                          <button className="btn-red" style={{ padding: '4px 10px', fontSize: 11 }}>
                            Watch
                          </button>
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* ── GENRES ────────────────────────────────────────────────────── */}
          <div
            className="rounded-[14px] p-4"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.05)',
            }}
          >
            <h3
              className="text-white mb-3"
              style={{ fontSize: 13, fontWeight: 700, fontFamily: 'Outfit, sans-serif' }}
            >
              Browse by Genre
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {GENRES.map(g => (
                <Link
                  key={g.id}
                  href={`/browse/movies?genre=${g.id}`}
                >
                  <div className="genre-card">{g.name}</div>
                </Link>
              ))}
            </div>
          </div>

        </aside>
      </div>
    </div>
  )
}
