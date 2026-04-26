'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { getDetails, getCredits, getSimilar, getVideos } from '@/lib/tmdb'
import type { Movie, Cast, MediaItem, Video } from '@/lib/types'
import { MovieDetailClient } from './MovieDetailClient'

export default function MovieDetailPage() {
  const params = useParams<{ id: string }>()
  const id = Number(params.id)

  const [movie, setMovie] = useState<Movie | null>(null)
  const [credits, setCredits] = useState<{ cast: Cast[] }>({ cast: [] })
  const [similar, setSimilar] = useState<MediaItem[]>([])
  const [trailerKey, setTrailerKey] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isNaN(id)) return
    Promise.all([
      getDetails('movie', id).catch(() => null),
      getCredits('movie', id).catch(() => ({ cast: [] })),
      getSimilar('movie', id).catch(() => ({ results: [] })),
      getVideos('movie', id).catch(() => ({ results: [] })),
    ])
      .then(([movieData, creditsData, similarData, videosData]) => {
        setMovie(movieData as Movie)
        setCredits(creditsData)
        setSimilar(
          similarData.results
            .slice(0, 20)
            .map((i: any) => ({ ...i, media_type: 'movie' as const }))
        )
        const trailer = (videosData.results as Video[]).find(
          (v) => v.site === 'YouTube' && v.type === 'Trailer'
        )
        setTrailerKey(trailer?.key ?? null)
      })
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: '#030305' }}>
        <div className="h-[60vh] skeleton" />
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 mt-8 space-y-4">
          <div className="skeleton h-8 w-64 rounded-xl" />
          <div className="skeleton h-4 w-full max-w-2xl rounded-xl" />
          <div className="skeleton h-4 w-3/4 max-w-2xl rounded-xl" />
        </div>
      </div>
    )
  }

  if (!movie) return null

  return (
    <div className="min-h-screen" style={{ background: '#030305' }}>
      <MovieDetailClient
        movieId={id}
        movieTitle={movie.title}
        posterPath={movie.poster_path}
        voteAverage={movie.vote_average}
        trailerKey={trailerKey}
        movie={movie}
        credits={credits}
        similar={similar}
      />
    </div>
  )
}
