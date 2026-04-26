'use client'
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Play, Heart, Youtube } from 'lucide-react'
import { useWatchlist } from '@/context/WatchlistContext'
import { TrailerModal } from '@/components/TrailerModal'
import { AddToListButton } from '@/components/AddToListButton'
import { CastRow } from '@/components/CastRow'
import { backdropURL, posterURL } from '@/lib/constants'
import type { Movie, Cast, MediaItem } from '@/lib/types'

interface Props {
  movieId: number
  movieTitle: string
  posterPath: string | null
  voteAverage: number
  trailerKey: string | null
  movie: Movie
  credits: { cast: Cast[] }
  similar: MediaItem[]
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <h2 className="section-heading whitespace-nowrap">{title}</h2>
      <div className="hairline flex-1" />
    </div>
  )
}

export function MovieDetailClient({
  movieId,
  movieTitle,
  posterPath,
  voteAverage,
  trailerKey,
  movie,
  credits,
  similar,
}: Props) {
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist()
  const [showTrailer, setShowTrailer] = useState(false)
  const inList = isInWatchlist(movieId)

  function toggleWatchlist() {
    if (inList) {
      removeFromWatchlist(movieId)
    } else {
      addToWatchlist({
        id: movieId,
        type: 'movie',
        title: movieTitle,
        poster_path: posterPath,
        vote_average: voteAverage,
        addedAt: new Date().toISOString(),
      })
    }
  }

  const year = movie.release_date?.slice(0, 4)
  const runtime = movie.runtime
    ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m`
    : null
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : null

  return (
    <>
      {/* Backdrop */}
      <div className="relative h-[60vh]">
        <Image
          src={backdropURL(movie.backdrop_path)}
          alt={movie.title}
          fill
          priority
          className="object-cover img-reveal"
          sizes="100vw"
          onLoad={(e) => (e.target as HTMLImageElement).classList.add('loaded')}
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to bottom,rgba(3,3,5,0.2) 0%,rgba(3,3,5,0.7) 60%,#030305 100%)',
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to right,rgba(3,3,5,0.8),transparent 60%)',
          }}
        />
      </div>

      {/* Content */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 -mt-28 relative z-10">
        <div className="flex gap-8 items-start">
          {/* Poster */}
          <div
            className="hidden md:block shrink-0 w-[200px]"
            style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}
          >
            <div className="relative w-[200px] aspect-[2/3] rounded-2xl overflow-hidden">
              <Image
                src={posterURL(movie.poster_path, 'w342')}
                alt={movie.title}
                fill
                className="object-cover img-reveal"
                sizes="200px"
                onLoad={(e) =>
                  (e.target as HTMLImageElement).classList.add('loaded')
                }
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
              />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 pt-4">
            {/* Meta chips */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {year && (
                <span
                  className="glass label-small"
                  style={{ padding: '4px 10px', borderRadius: 100 }}
                >
                  {year}
                </span>
              )}
              {runtime && (
                <span
                  className="glass label-small"
                  style={{ padding: '4px 10px', borderRadius: 100 }}
                >
                  {runtime}
                </span>
              )}
              {rating && (
                <span
                  className="label-small"
                  style={{
                    padding: '4px 10px',
                    borderRadius: 100,
                    background: 'var(--green-bg)',
                    color: 'var(--green)',
                    border: '1px solid rgba(70,211,105,0.25)',
                  }}
                >
                  ★ {rating}
                </span>
              )}
              {movie.genres?.map((g) => (
                <span
                  key={g.id}
                  className="glass label-small"
                  style={{ padding: '4px 10px', borderRadius: 100 }}
                >
                  {g.name}
                </span>
              ))}
            </div>

            {/* Title */}
            <h1
              style={{
                fontFamily: 'Playfair Display,Georgia,serif',
                fontWeight: 900,
                fontSize: 'clamp(28px,4vw,40px)',
                letterSpacing: '-1.5px',
                lineHeight: 1.1,
                marginBottom: 16,
                color: '#fff',
              }}
            >
              {movie.title}
            </h1>

            {/* Tagline */}
            {movie.tagline && (
              <p
                className="label-small mb-3"
                style={{
                  color: 'rgba(255,255,255,0.4)',
                  fontStyle: 'italic',
                }}
              >
                {movie.tagline}
              </p>
            )}

            {/* Overview */}
            <p className="body-text max-w-2xl mb-6">{movie.overview}</p>

            {/* Buttons */}
            <div className="flex flex-wrap gap-3 mb-8">
              <Link href={`/watch/movie/${movieId}`} className="btn-watch">
                <Play size={16} fill="currentColor" />
                Watch Now
              </Link>
              <button
                onClick={toggleWatchlist}
                className="btn-list"
                aria-label={inList ? 'Remove from watchlist' : 'Add to watchlist'}
                style={
                  inList
                    ? { color: '#e50914', borderColor: 'rgba(229,9,20,0.4)' }
                    : undefined
                }
              >
                <Heart size={16} fill={inList ? 'currentColor' : 'none'} />
                {inList ? 'In Watchlist' : 'Watchlist'}
              </button>
              <AddToListButton
                itemId={movieId}
                itemType="movie"
                itemTitle={movieTitle}
                posterPath={posterPath}
              />
              {trailerKey && (
                <button
                  onClick={() => setShowTrailer(true)}
                  className="btn-list"
                  aria-label={`Watch ${movieTitle} trailer`}
                >
                  <Youtube size={16} />
                  Trailer
                </button>
              )}
            </div>

            {/* Cast */}
            {credits.cast.length > 0 && (
              <div className="mb-8">
                <SectionHeader title="Cast" />
                <CastRow cast={credits.cast} />
              </div>
            )}
          </div>
        </div>

        {/* More Like This */}
        {similar.length > 0 && (
          <div className="mt-16 mb-12">
            <SectionHeader title="More Like This" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {similar.slice(0, 10).map((item) => {
                const itemTitle =
                  item.media_type === 'movie'
                    ? (item as Movie).title
                    : (item as import('@/lib/types').TVShow).name
                return (
                  <Link
                    key={item.id}
                    href={`/movie/${item.id}`}
                    className="card-media block group"
                  >
                    <div className="relative aspect-[2/3] rounded-[14px] overflow-hidden">
                      <Image
                        src={posterURL(item.poster_path, 'w342')}
                        alt={itemTitle ?? ''}
                        fill
                        className="object-cover img-reveal"
                        sizes="(max-width:640px) 50vw,(max-width:1024px) 33vw,20vw"
                        onLoad={(e) =>
                          (e.target as HTMLImageElement).classList.add('loaded')
                        }
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                      />
                    </div>
                    <p
                      className="mt-2 text-white truncate"
                      style={{
                        fontFamily: 'Instrument Sans,sans-serif',
                        fontSize: 13,
                        fontWeight: 600,
                      }}
                    >
                      {itemTitle}
                    </p>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {showTrailer && trailerKey && (
        <TrailerModal videoKey={trailerKey} onClose={() => setShowTrailer(false)} />
      )}
    </>
  )
}
