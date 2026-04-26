'use client'
import { useEffect } from 'react'
import { Heart, Check } from 'lucide-react'
import { useWatchlist } from '@/context/WatchlistContext'
import { WatchPageShortcuts } from '@/components/WatchPageShortcuts'

interface Props {
  movieId: number
  movieTitle: string
  posterPath: string | null
  overview: string
  voteAverage: number
  releaseDate?: string
  runtime?: number
}

export function MovieWatchClient({
  movieId,
  movieTitle,
  posterPath,
  overview,
  voteAverage,
  releaseDate,
  runtime,
}: Props) {
  const { addToHistory, addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist()
  const inList = isInWatchlist(movieId)

  useEffect(() => {
    addToHistory({
      id: movieId,
      type: 'movie',
      title: movieTitle,
      poster_path: posterPath,
      watchedAt: new Date().toISOString(),
    })
  }, [movieId]) // eslint-disable-line react-hooks/exhaustive-deps

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

  const year = releaseDate ? releaseDate.slice(0, 4) : null
  const rating = voteAverage > 0 ? voteAverage.toFixed(1) : null

  return (
    <div className="max-w-[1400px] mx-auto px-0 py-6">
      <WatchPageShortcuts />

      {/* Glass info panel */}
      <div className="glass glass-blur rounded-[20px] p-6 mb-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
            <h1
              style={{
                fontFamily: 'Playfair Display,Georgia,serif',
                fontWeight: 900,
                fontSize: 28,
                letterSpacing: '-1px',
              }}
              className="text-white mb-2 leading-tight"
            >
              {movieTitle}
            </h1>

            <div className="flex gap-3 items-center flex-wrap">
              {year && (
                <>
                  <span className="label-small text-muted">{year}</span>
                  <span className="label-small text-muted">·</span>
                </>
              )}
              {runtime && runtime > 0 && (
                <>
                  <span className="label-small text-muted">{runtime}m</span>
                  <span className="label-small text-muted">·</span>
                </>
              )}
              {rating && (
                <span className="label-small" style={{ color: '#46d369' }}>
                  ★ {rating}
                </span>
              )}
            </div>

            {overview && (
              <p className="body-text mt-3 max-w-2xl line-clamp-2">{overview}</p>
            )}
          </div>

          <button
            onClick={toggleWatchlist}
            className="btn-list flex-shrink-0 flex items-center gap-2"
            aria-label={inList ? 'Remove from watchlist' : 'Add to watchlist'}
          >
            {inList ? <Check size={16} /> : <Heart size={16} />}
            {inList ? 'Saved' : 'Watchlist'}
          </button>
        </div>
      </div>
    </div>
  )
}
