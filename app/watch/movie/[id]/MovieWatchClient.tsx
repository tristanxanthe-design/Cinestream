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
