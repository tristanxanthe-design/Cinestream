'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { searchMulti } from '@/lib/tmdb'

const IMAGE_BASE = 'https://image.tmdb.org/t/p/w342'

interface SearchResult {
  id: number
  media_type: 'movie' | 'tv'
  title?: string
  name?: string
  poster_path: string | null
  release_date?: string
  first_air_date?: string
}

function getYear(item: SearchResult): string {
  const date = item.release_date ?? item.first_air_date ?? ''
  return date ? date.slice(0, 4) : ''
}

function getTitle(item: SearchResult): string {
  return item.title ?? item.name ?? ''
}

export default function SearchPage() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)

  // Auto-focus on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // 300ms debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim())
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  // Fetch when debounced query changes
  const fetchResults = useCallback(async (q: string) => {
    if (!q) {
      setResults([])
      return
    }
    setLoading(true)
    try {
      const data = await searchMulti(q)
      const filtered = (data.results as SearchResult[]).filter(
        (r) =>
          (r.media_type === 'movie' || r.media_type === 'tv') &&
          r.poster_path
      )
      setResults(filtered)
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchResults(debouncedQuery)
  }, [debouncedQuery, fetchResults])

  function clearQuery() {
    setQuery('')
    setResults([])
    inputRef.current?.focus()
  }

  const hasQuery = query.length > 0
  const hasResults = results.length > 0

  return (
    <div
      style={{ background: 'var(--bg)', minHeight: '100vh' }}
      className="pt-24 pb-20 px-6 md:px-12"
    >
      <div className="max-w-[1400px] mx-auto">
      {/* Page title */}
      <h1
        style={{
          fontFamily: 'Playfair Display, Georgia, serif',
          fontWeight: 900,
          fontSize: 'clamp(32px, 4vw, 48px)',
          letterSpacing: '-1.5px',
          color: '#fff',
          marginBottom: '2rem',
        }}
      >
        Search
      </h1>

      {/* Input */}
      <div
        className="glass glass-blur"
        style={{
          borderRadius: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          padding: '1rem 1.25rem',
          marginBottom: '2.5rem',
          maxWidth: 720,
        }}
      >
        {/* Search icon */}
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ flexShrink: 0 }}
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>

        <input
          ref={inputRef}
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search movies, TV shows..."
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: '#fff',
            fontFamily: 'Instrument Sans, sans-serif',
            fontSize: 16,
          }}
        />

        {/* Clear button */}
        {hasQuery && (
          <button
            onClick={clearQuery}
            aria-label="Clear search"
            style={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.08)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              color: 'rgba(255,255,255,0.5)',
              transition: 'background 0.2s',
            }}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      {/* Empty state — no query */}
      {!hasQuery && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            paddingTop: '5rem',
            gap: '1.25rem',
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <p
            className="body-text"
            style={{ color: 'rgba(255,255,255,0.2)', textAlign: 'center' }}
          >
            Start typing to search
          </p>
        </div>
      )}

      {/* Loading skeletons */}
      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div
                className="skeleton"
                style={{ borderRadius: 14, aspectRatio: '2/3', width: '100%' }}
              />
              <div className="skeleton" style={{ height: 12, borderRadius: 6, width: '70%' }} />
              <div className="skeleton" style={{ height: 10, borderRadius: 6, width: '40%' }} />
            </div>
          ))}
        </div>
      )}

      {/* No results */}
      {!loading && hasQuery && debouncedQuery && !hasResults && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            paddingTop: '5rem',
            gap: '0.75rem',
          }}
        >
          <p
            style={{
              fontFamily: 'Playfair Display, Georgia, serif',
              fontWeight: 700,
              fontSize: 24,
              color: 'rgba(255,255,255,0.15)',
              textAlign: 'center',
            }}
          >
            No results for &ldquo;{debouncedQuery}&rdquo;
          </p>
          <p className="body-text" style={{ color: 'rgba(255,255,255,0.2)' }}>
            Try a different title or keyword
          </p>
        </div>
      )}

      {/* Results */}
      {!loading && hasResults && (
        <>
          <p
            className="label-small"
            style={{ color: 'rgba(255,255,255,0.3)', marginBottom: '1rem' }}
          >
            {results.length} results
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {results.map((item) => (
              <Link
                key={`${item.media_type}-${item.id}`}
                href={`/${item.media_type}/${item.id}`}
                className="card-media"
                style={{ display: 'block', textDecoration: 'none' }}
              >
                {/* Poster */}
                <div style={{ position: 'relative', aspectRatio: '2/3', borderRadius: 14, overflow: 'hidden', background: 'rgba(255,255,255,0.04)' }}>
                  <Image
                    src={`${IMAGE_BASE}${item.poster_path}`}
                    alt={getTitle(item)}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
                    className="img-reveal loaded"
                    style={{ objectFit: 'cover' }}
                  />
                  {/* Media type badge */}
                  <span
                    className="label-small"
                    style={{
                      position: 'absolute',
                      top: 8,
                      left: 8,
                      background: 'rgba(0,0,0,0.7)',
                      backdropFilter: 'blur(8px)',
                      color: item.media_type === 'movie' ? 'rgba(255,255,255,0.7)' : '#ff6b6b',
                      padding: '2px 6px',
                      borderRadius: 4,
                    }}
                  >
                    {item.media_type === 'movie' ? 'Movie' : 'TV'}
                  </span>
                </div>

                {/* Title & year */}
                <div style={{ padding: '8px 2px 0' }}>
                  <p
                    style={{
                      fontFamily: 'Instrument Sans, sans-serif',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: 'rgba(255,255,255,0.85)',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                      lineHeight: 1.3,
                    }}
                  >
                    {getTitle(item)}
                  </p>
                  {getYear(item) && (
                    <p
                      className="label-small"
                      style={{ color: 'rgba(255,255,255,0.3)', marginTop: 2 }}
                    >
                      {getYear(item)}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
      </div>
    </div>
  )
}
