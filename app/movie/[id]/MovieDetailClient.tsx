'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Play, Heart, Youtube } from 'lucide-react'
import { useWatchlist } from '@/context/WatchlistContext'
import { TrailerModal } from '@/components/TrailerModal'
import { AddToListButton } from '@/components/AddToListButton'

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
        <AddToListButton itemId={movieId} itemType="movie" itemTitle={movieTitle} posterPath={posterPath} />
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
