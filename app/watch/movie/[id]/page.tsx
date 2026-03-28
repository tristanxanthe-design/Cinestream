'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { getDetails } from '@/lib/tmdb'
import { Player } from '@/components/Player'
import { BackButton } from '@/components/BackButton'
import type { Movie } from '@/lib/types'
import { MovieWatchClient } from './MovieWatchClient'

export default function WatchMoviePage() {
  const params = useParams<{ id: string }>()
  const id = Number(params.id)

  const [movie, setMovie] = useState<Movie | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isNaN(id)) return
    getDetails('movie', id)
      .then((data) => setMovie(data as Movie))
      .catch(() => setMovie(null))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="pt-16 min-h-screen bg-[#141414]">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="mb-4 h-8 w-24 bg-zinc-800 rounded animate-pulse" />
          <div className="w-full aspect-video bg-zinc-900 rounded-lg animate-pulse" />
        </div>
      </div>
    )
  }

  if (!movie) return null

  return (
    <div className="pt-16 min-h-screen bg-[#141414]">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="mb-4">
          <BackButton />
        </div>
        <Player type="movie" id={id} />
        <MovieWatchClient
          movieId={id}
          movieTitle={movie.title}
          posterPath={movie.poster_path}
          overview={movie.overview}
        />
      </div>
    </div>
  )
}
