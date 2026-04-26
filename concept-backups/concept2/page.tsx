'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Play,
  Zap,
  Search as SearchIcon,
  Bookmark,
  Shield,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { getTrending, getPopular } from '@/lib/tmdb'
import type { MediaItem, Movie, TVShow } from '@/lib/types'

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

// ─── Static constants ─────────────────────────────────────────────────────────

// P3-6: Defined at module level — never changes, no reason to recreate on every
// render inside the component body.
const hero3DOffsets = [
  {
    rotateY: '-8deg',
    rotateX: '4deg',
    x: 0,
    y: 0,
    z: 0,
    scale: 1,
  },
  {
    rotateY: '-4deg',
    rotateX: '2deg',
    x: -30,
    y: -15,
    z: -20,
    scale: 0.95,
  },
  {
    rotateY: '0deg',
    rotateX: '0deg',
    x: -60,
    y: -30,
    z: -40,
    scale: 0.9,
  },
]

// ─── Scroll Reveal Hook ───────────────────────────────────────────────────────

function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add('visible')
        }),
      { threshold: 0.1 }
    )
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])
}

// ─── 3D Tilt Hook ─────────────────────────────────────────────────────────────

function useTilt(ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    // P1-5: Guard for SSR, then bail when prefers-reduced-motion is set.
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return

    const el = ref.current
    if (!el) return
    let raf: number
    const onMove = (e: MouseEvent) => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect()
        const x = (e.clientX - rect.left) / rect.width - 0.5
        const y = (e.clientY - rect.top) / rect.height - 0.5
        el.style.transform = `perspective(800px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) scale(1.02)`
        el.style.transition = 'transform 0.1s ease-out'
      })
    }
    const onLeave = () => {
      cancelAnimationFrame(raf)
      el.style.transform =
        'perspective(800px) rotateY(0) rotateX(0) scale(1)'
      el.style.transition = 'transform 0.4s ease-out'
    }
    el.addEventListener('mousemove', onMove)
    el.addEventListener('mouseleave', onLeave)
    return () => {
      el.removeEventListener('mousemove', onMove)
      el.removeEventListener('mouseleave', onLeave)
    }
  }, [ref])
}

// ─── Carousel Row ─────────────────────────────────────────────────────────────

interface CarouselRowProps {
  title: string
  items: MediaItem[]
  loading: boolean
  // P0-3: Optional destination for the "See all" link.
  browseHref?: string
}

function CarouselRow({ title, items, loading, browseHref = '/browse/movies' }: CarouselRowProps) {
  // P1-3: Single ref attached to the scroll container. One delegated mousemove
  // listener drives all card tilts — no per-card listeners, no querySelectorAll.
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (loading) return

    // P1-5: Guard for SSR, then bail when prefers-reduced-motion is set.
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return

    const container = scrollRef.current
    if (!container) return

    let raf: number

    // Delegated mousemove — find the card under the cursor and tilt only it.
    const onMove = (e: MouseEvent) => {
      const card = (e.target as HTMLElement).closest<HTMLElement>('.tilt-card')
      if (!card) return
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const rect = card.getBoundingClientRect()
        const x = (e.clientX - rect.left) / rect.width - 0.5
        const y = (e.clientY - rect.top) / rect.height - 0.5
        card.style.transform = `perspective(600px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) scale(1.03)`
        card.style.transition = 'transform 0.1s ease-out'
      })
    }

    // Container mouseleave — reset every tilt-card child in one pass.
    const onLeave = () => {
      cancelAnimationFrame(raf)
      container.querySelectorAll<HTMLElement>('.tilt-card').forEach((card) => {
        card.style.transform =
          'perspective(600px) rotateY(0) rotateX(0) scale(1)'
        card.style.transition = 'transform 0.4s ease-out'
      })
    }

    container.addEventListener('mousemove', onMove)
    container.addEventListener('mouseleave', onLeave)

    return () => {
      cancelAnimationFrame(raf)
      container.removeEventListener('mousemove', onMove)
      container.removeEventListener('mouseleave', onLeave)
    }
  }, [loading])

  const scroll = useCallback((dir: -1 | 1) => {
    const el = scrollRef.current
    if (!el) return
    el.scrollBy({ left: dir * 420, behavior: 'smooth' })
  }, [])

  return (
    <div className="reveal mb-14 last:mb-0">
      {/* Section header */}
      <div className="flex items-center justify-between mb-5">
        <h2
          style={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 700,
            fontSize: '18px',
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
          }}
        >
          {title}
        </h2>
        <div className="flex items-center gap-2">
          {/* P1-4: w-11 h-11 = 44 px meets the minimum touch-target size. */}
          <button
            onClick={() => scroll(-1)}
            aria-label="Scroll left"
            className="w-11 h-11 rounded-full flex items-center justify-center transition-colors"
            style={{
              background: 'rgba(255,255,255,0.06)',
              color: 'rgba(255,255,255,0.5)',
            }}
          >
            <ChevronLeft size={14} />
          </button>
          <button
            onClick={() => scroll(1)}
            aria-label="Scroll right"
            className="w-11 h-11 rounded-full flex items-center justify-center transition-colors"
            style={{
              background: 'rgba(255,255,255,0.06)',
              color: 'rgba(255,255,255,0.5)',
            }}
          >
            <ChevronRight size={14} />
          </button>
          {/* P0-3: Functional <Link> with aria-label and CSS-only hover state.
              No inline onMouseEnter/onMouseLeave style manipulation. */}
          <Link
            href={browseHref}
            aria-label={`See all ${title}`}
            className="text-[rgba(255,255,255,0.55)] hover:text-white text-xs transition-colors"
          >
            See all →
          </Link>
        </div>
      </div>

      {/* Cards */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-4 no-scrollbar"
      >
        {loading
          ? Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="shrink-0 animate-pulse rounded-[14px]"
                style={{
                  width: '130px',
                  height: '190px',
                  background: 'rgba(255,255,255,0.05)',
                }}
              />
            ))
          : items.length === 0
          ? (
              <p
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 400,
                  fontSize: '14px',
                  color: 'rgba(255,255,255,0.45)',
                  padding: '20px 0',
                }}
              >
                Nothing to show right now — check back soon.
              </p>
            )
          : items.map((item) => {
              const itemTitle = mediaTitle(item)
              const href = watchHref(item)
              return (
                <Link
                  key={item.id}
                  href={href}
                  className="shrink-0 group relative tilt-card"
                  style={{
                    width: '130px',
                    height: '190px',
                    borderRadius: '14px',
                    overflow: 'hidden',
                    border: '1px solid rgba(255,255,255,0.06)',
                    display: 'block',
                  }}
                >
                  {/* Poster */}
                  {item.poster_path ? (
                    <Image
                      src={`https://image.tmdb.org/t/p/w300${item.poster_path}`}
                      alt={itemTitle}
                      fill
                      sizes="130px"
                      className="object-cover"
                    />
                  ) : (
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background:
                          'linear-gradient(135deg, rgba(120,50,255,0.2), rgba(5,5,7,0.8))',
                      }}
                    />
                  )}

                  {/* Hover overlay */}
                  <div
                    className="group-hover:opacity-100"
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background:
                        'linear-gradient(to top, rgba(5,5,7,0.9) 0%, transparent 60%)',
                      opacity: 0,
                      transition: 'opacity 0.2s',
                    }}
                  />

                  {/* Play button */}
                  <div
                    className="group-hover:opacity-100 group-hover:scale-100"
                    style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: 0,
                      transition: 'opacity 0.2s, transform 0.2s',
                      transform: 'scale(0.8)',
                    }}
                  >
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: 'rgba(120,50,255,0.9)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 0 20px rgba(120,50,255,0.5)',
                      }}
                    >
                      <Play size={16} fill="white" color="white" />
                    </div>
                  </div>

                  {/* Title at bottom */}
                  <div
                    className="group-hover:opacity-100"
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      padding: '8px',
                      opacity: 0,
                      transition: 'opacity 0.2s',
                    }}
                  >
                    <p
                      className="truncate"
                      style={{
                        fontFamily: "'Syne', sans-serif",
                        fontWeight: 600,
                        fontSize: '11px',
                        lineHeight: 1.2,
                        color: '#fff',
                      }}
                    >
                      {itemTitle}
                    </p>
                  </div>
                </Link>
              )
            })}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const [heroItems, setHeroItems] = useState<MediaItem[]>([])
  const [trending, setTrending] = useState<MediaItem[]>([])
  const [popularMovies, setPopularMovies] = useState<MediaItem[]>([])
  const [popularTV, setPopularTV] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(false)

  useScrollReveal()

  // Hero entrance stagger — add .visible to .hero-content after a short delay
  useEffect(() => {
    const id = setTimeout(() => {
      document.querySelector('.hero-content')?.classList.add('visible')
    }, 100)
    return () => clearTimeout(id)
  }, [])

  useEffect(() => {
    Promise.all([
      getTrending('movie', 'day'),
      getPopular('movie'),
      getPopular('tv'),
    ])
      .then(([t, pm, ptv]) => {
        setHeroItems(
          t.results
            .slice(0, 5)
            .map((i) => ({ ...i, media_type: 'movie' as const })) as unknown as MediaItem[]
        )
        setTrending(
          t.results.map((i) => ({ ...i, media_type: 'movie' as const })) as unknown as MediaItem[]
        )
        setPopularMovies(
          pm.results.map((i) => ({ ...i, media_type: 'movie' as const })) as unknown as MediaItem[]
        )
        setPopularTV(
          ptv.results.map((i) => ({ ...i, media_type: 'tv' as const })) as unknown as MediaItem[]
        )
      })
      .catch(() => setFetchError(true))
      .finally(() => setLoading(false))
  }, [])

  const features = [
    {
      icon: <Zap size={20} />,
      title: 'Multiple Servers',
      desc: 'Fallback sources so nothing ever buffers',
    },
    {
      icon: <SearchIcon size={20} />,
      title: 'Smart Search',
      desc: 'Find any movie or show instantly',
    },
    {
      icon: <Bookmark size={20} />,
      title: 'Your Watchlist',
      desc: 'Save anything, continue anywhere',
    },
    {
      icon: <Shield size={20} />,
      title: 'Zero Ads',
      desc: 'Pure content, nothing else',
    },
  ]

  return (
    <div className="min-h-screen">
      {/* ── Fetch error banner ───────────────────────────────────────────── */}
      {fetchError && (
        <div
          role="alert"
          style={{
            position: 'fixed',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 60,
            background: 'rgba(229,9,20,0.12)',
            border: '1px solid rgba(229,9,20,0.3)',
            borderRadius: '12px',
            padding: '12px 20px',
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '13px',
            color: 'rgba(255,255,255,0.85)',
            whiteSpace: 'nowrap',
          }}
        >
          Could not load content — check your connection and refresh.
        </div>
      )}
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          paddingTop: '80px',
        }}
      >
        {/* P0-2: flex-col on mobile, flex-row on lg+. Gap scales accordingly.
            pb-12 on mobile gives breathing room before the next section. */}
        <div
          className="max-w-7xl mx-auto px-6 lg:px-12 w-full flex flex-col lg:flex-row items-center gap-8 lg:gap-12 pb-12 lg:pb-0"
        >
          {/* Left column */}
          <div className="hero-content flex flex-col gap-6" style={{ flex: 1 }}>
            {/* Badge */}
            <div className="badge-purple w-fit hero-el">
              <span className="pulse-dot" />
              Now streaming
            </div>

            {/* Title */}
            <h1
              className="hero-el"
              style={{
                fontFamily: "'Syne', sans-serif",
                fontWeight: 800,
                fontSize: 'clamp(36px, 5vw, 52px)',
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
                color: '#fff',
                margin: 0,
              }}
            >
              Discover your next{' '}
              <span className="gradient-text">obsession</span>
            </h1>

            {/* Description */}
            <p
              className="hero-el"
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 300,
                fontSize: '16px',
                color: 'rgba(255,255,255,0.65)',
                maxWidth: '440px',
                lineHeight: 1.7,
                margin: 0,
              }}
            >
              Movies, TV shows, and anime — all in one place. Stream anything,
              anytime, with zero interruptions.
            </p>

            {/* Buttons */}
            <div className="flex gap-3 flex-wrap hero-el">
              <Link href="/browse/movies" className="btn-primary">
                <Play size={15} fill="currentColor" /> Browse Movies
              </Link>
              <Link href="/browse/tv" className="btn-ghost">
                <Zap size={15} /> TV Shows
              </Link>
            </div>

            {/* Stats row intentionally removed — "10K+ Titles / 4K Quality / Zero Ads"
                was decorative AI-generated filler that added no real value. */}
          </div>

          {/* Right column — 3D card stack (lg+) */}
          <div
            className="hidden lg:flex items-center justify-center relative"
            style={{ width: '420px', flexShrink: 0 }}
          >
            <div
              style={{
                position: 'relative',
                width: '300px',
                height: '420px',
                perspective: '1000px',
              }}
            >
              {heroItems.slice(0, 3).map((item, i) => {
                const o = hero3DOffsets[i]
                const itemTitle = mediaTitle(item)
                const href = watchHref(item)
                return (
                  <Link
                    key={item.id}
                    href={href}
                    className="tilt-card block"
                    style={{
                      position: 'absolute',
                      inset: 0,
                      transform: `perspective(1000px) rotateY(${o.rotateY}) rotateX(${o.rotateX}) translateX(${o.x}px) translateY(${o.y}px) translateZ(${o.z}px) scale(${o.scale})`,
                      transition: 'transform 0.3s ease-out',
                      borderRadius: '14px',
                      overflow: 'hidden',
                      boxShadow:
                        i === 0
                          ? '0 40px 80px rgba(0,0,0,0.6), 0 0 40px rgba(120,50,255,0.1)'
                          : '0 20px 40px rgba(0,0,0,0.4)',
                    }}
                    onMouseEnter={(e) => {
                      ;(
                        e.currentTarget as HTMLElement
                      ).style.transform = `perspective(1000px) rotateY(${o.rotateY}) rotateX(${o.rotateX}) translateX(${o.x}px) translateY(${o.y}px) translateZ(20px) scale(${o.scale})`
                    }}
                    onMouseLeave={(e) => {
                      ;(
                        e.currentTarget as HTMLElement
                      ).style.transform = `perspective(1000px) rotateY(${o.rotateY}) rotateX(${o.rotateX}) translateX(${o.x}px) translateY(${o.y}px) translateZ(${o.z}px) scale(${o.scale})`
                    }}
                  >
                    {item.poster_path && (
                      <Image
                        src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                        alt={itemTitle}
                        fill
                        sizes="300px"
                        className="object-cover"
                      />
                    )}
                    {/* Gradient overlay */}
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background:
                          'linear-gradient(to top, rgba(5,5,7,0.9) 0%, transparent 50%)',
                      }}
                    />
                    {/* Title */}
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '16px',
                        left: '16px',
                        right: '16px',
                      }}
                    >
                      <p
                        style={{
                          fontFamily: "'Syne', sans-serif",
                          fontWeight: 700,
                          fontSize: '14px',
                          lineHeight: 1.1,
                          color: '#fff',
                          margin: 0,
                        }}
                      >
                        {itemTitle}
                      </p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section className="py-20 reveal">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
          {features.map((feat) => (
            <div
              key={feat.title}
              className="glass rounded-[20px] p-6 flex flex-col gap-4 hover:-translate-y-1 transition-transform duration-200"
            >
              {/* Icon */}
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(120,50,255,0.12)',
                  color: '#a78bfa',
                  flexShrink: 0,
                }}
              >
                {feat.icon}
              </div>
              {/* Title */}
              <h3
                style={{
                  fontFamily: "'Syne', sans-serif",
                  fontWeight: 700,
                  fontSize: '15px',
                  lineHeight: 1.1,
                  color: '#fff',
                  margin: 0,
                }}
              >
                {feat.title}
              </h3>
              {/* Desc */}
              <p
                className="text-secondary"
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 300,
                  fontSize: '14px',
                  lineHeight: 1.7,
                  margin: 0,
                }}
              >
                {feat.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Carousels ────────────────────────────────────────────────────── */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <CarouselRow
            title="Trending Today"
            items={trending}
            loading={loading}
            browseHref="/browse/movies"
          />
          <CarouselRow
            title="Popular Movies"
            items={popularMovies}
            loading={loading}
            browseHref="/browse/movies"
          />
          <CarouselRow
            title="Popular TV Shows"
            items={popularTV}
            loading={loading}
            browseHref="/browse/tv"
          />
        </div>
      </section>
    </div>
  )
}
