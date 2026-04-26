'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { getPopular, discoverByGenre, getGenres } from '@/lib/tmdb'
import type { Genre } from '@/lib/types'

const IMAGE_BASE = 'https://image.tmdb.org/t/p/w342'

interface BrowseClientProps {
  mediaType: 'movie' | 'tv'
  title: string
}

interface MediaItem {
  id: number
  title?: string
  name?: string
  poster_path: string | null
  release_date?: string
  first_air_date?: string
  media_type: 'movie' | 'tv'
}

function getYear(item: MediaItem): string {
  const date = item.release_date ?? item.first_air_date ?? ''
  return date ? date.slice(0, 4) : ''
}

function getTitle(item: MediaItem): string {
  return item.title ?? item.name ?? ''
}

export default function BrowseClient({ mediaType, title }: BrowseClientProps) {
  const [genres, setGenres] = useState<Genre[]>([])
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null)
  const [items, setItems] = useState<MediaItem[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(false)
  const [genresLoading, setGenresLoading] = useState(true)

  // Fetch genres on mount
  useEffect(() => {
    setGenresLoading(true)
    getGenres(mediaType)
      .then((data) => setGenres(data.genres))
      .catch(() => setGenres([]))
      .finally(() => setGenresLoading(false))
  }, [mediaType])

  const fetchItems = useCallback(
    async (genreId: number | null, p: number) => {
      setLoading(true)
      try {
        const data = genreId
          ? await discoverByGenre(mediaType, genreId, p)
          : await getPopular(mediaType, p)
        const tagged = (data.results as Omit<MediaItem, 'media_type'>[]).map((i) => ({
          ...i,
          media_type: mediaType,
        })) as MediaItem[]
        setItems((prev) => (p === 1 ? tagged : [...prev, ...tagged]))
        setHasMore(p < data.total_pages)
      } catch {
        // leave existing items in place
      } finally {
        setLoading(false)
      }
    },
    [mediaType]
  )

  // Reset and fetch when genre selection changes
  useEffect(() => {
    setPage(1)
    setItems([])
    fetchItems(selectedGenre, 1)
  }, [selectedGenre, fetchItems])

  function handleGenreSelect(genreId: number | null) {
    setSelectedGenre(genreId)
  }

  function loadMore() {
    const next = page + 1
    setPage(next)
    fetchItems(selectedGenre, next)
  }

  const showSkeletons = loading && items.length === 0

  return (
    <div
      style={{ background: '#030305', minHeight: '100vh' }}
      className="pt-24 pb-20 px-6 md:px-12"
    >
      {/* Page title */}
      <h1
        style={{
          fontFamily: 'Playfair Display, Georgia, serif',
          fontWeight: 900,
          fontSize: 'clamp(32px, 4vw, 48px)',
          letterSpacing: '-1.5px',
          color: '#fff',
          marginBottom: '1.75rem',
        }}
      >
        {title}
      </h1>

      {/* Genre filter — horizontal scroll */}
      <div
        className="scrollbar-hide"
        style={{
          display: 'flex',
          gap: '0.5rem',
          overflowX: 'auto',
          paddingBottom: '0.25rem',
          marginBottom: '2rem',
        }}
      >
        {/* All pill */}
        <button
          onClick={() => handleGenreSelect(null)}
          className="label-small"
          style={{
            flexShrink: 0,
            padding: '6px 16px',
            borderRadius: 999,
            border: `1px solid ${selectedGenre === null ? 'rgba(229,9,20,0.3)' : 'var(--glass-border)'}`,
            background: selectedGenre === null ? 'rgba(229,9,20,0.15)' : 'var(--glass-bg)',
            color: selectedGenre === null ? '#ff6b6b' : 'rgba(255,255,255,0.5)',
            cursor: 'pointer',
            transition: 'all 0.2s',
            whiteSpace: 'nowrap',
          }}
        >
          All
        </button>

        {!genresLoading &&
          genres.map((genre) => (
            <button
              key={genre.id}
              onClick={() => handleGenreSelect(genre.id)}
              className="label-small"
              style={{
                flexShrink: 0,
                padding: '6px 16px',
                borderRadius: 999,
                border: `1px solid ${selectedGenre === genre.id ? 'rgba(229,9,20,0.3)' : 'var(--glass-border)'}`,
                background:
                  selectedGenre === genre.id ? 'rgba(229,9,20,0.15)' : 'var(--glass-bg)',
                color: selectedGenre === genre.id ? '#ff6b6b' : 'rgba(255,255,255,0.5)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap',
              }}
            >
              {genre.name}
            </button>
          ))}

        {/* Genre skeleton pills */}
        {genresLoading &&
          Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="skeleton"
              style={{ flexShrink: 0, height: 30, width: 72, borderRadius: 999 }}
            />
          ))}
      </div>

      {/* Media grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mb-8">
        {/* Skeleton initial load */}
        {showSkeletons &&
          Array.from({ length: 12 }).map((_, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div
                className="skeleton"
                style={{ borderRadius: 14, aspectRatio: '2/3', width: '100%' }}
              />
              <div className="skeleton" style={{ height: 12, borderRadius: 6, width: '70%' }} />
              <div className="skeleton" style={{ height: 10, borderRadius: 6, width: '40%' }} />
            </div>
          ))}

        {/* Actual cards */}
        {items.map((item) => (
          <Link
            key={`${item.media_type}-${item.id}`}
            href={`/${item.media_type}/${item.id}`}
            className="card-media"
            style={{ display: 'block', textDecoration: 'none' }}
          >
            <div
              style={{
                position: 'relative',
                aspectRatio: '2/3',
                borderRadius: 14,
                overflow: 'hidden',
                background: 'rgba(255,255,255,0.04)',
              }}
            >
              {item.poster_path ? (
                <Image
                  src={`${IMAGE_BASE}${item.poster_path}`}
                  alt={getTitle(item)}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
                  className="img-reveal loaded"
                  style={{ objectFit: 'cover' }}
                />
              ) : (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'rgba(255,255,255,0.1)',
                  }}
                >
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                  >
                    <rect x="2" y="2" width="20" height="20" rx="2" />
                    <path d="M7 17l3-4 2 3 2-2 3 3" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                  </svg>
                </div>
              )}
            </div>

            <div style={{ padding: '8px 2px 0' }}>
              <p
                className="body-text"
                style={{
                  color: 'rgba(255,255,255,0.85)',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  fontWeight: 500,
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

        {/* Append skeletons while loading more */}
        {loading &&
          items.length > 0 &&
          Array.from({ length: 6 }).map((_, i) => (
            <div key={`more-${i}`} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div
                className="skeleton"
                style={{ borderRadius: 14, aspectRatio: '2/3', width: '100%' }}
              />
              <div className="skeleton" style={{ height: 12, borderRadius: 6, width: '70%' }} />
              <div className="skeleton" style={{ height: 10, borderRadius: 6, width: '40%' }} />
            </div>
          ))}
      </div>

      {/* Load more */}
      {hasMore && !loading && (
        <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: '2rem' }}>
          <button onClick={loadMore} className="btn-list">
            Load more
          </button>
        </div>
      )}
    </div>
  )
}
