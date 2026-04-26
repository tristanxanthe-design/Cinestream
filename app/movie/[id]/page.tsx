'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import { getDetails, getCredits, getSimilar, getVideos } from '@/lib/tmdb'
import { backdropURL, posterURL } from '@/lib/constants'
import { RatingBadge } from '@/components/RatingBadge'
import { CastRow } from '@/components/CastRow'
import { ContentCarousel } from '@/components/ContentCarousel'
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
    ]).then(([movieData, creditsData, similarData, videosData]) => {
      setMovie(movieData as Movie)
      setCredits(creditsData)
      setSimilar(similarData.results.slice(0, 20).map((i: any) => ({ ...i, media_type: 'movie' as const })))
      const trailer = (videosData.results as Video[]).find((v) => v.site === 'YouTube' && v.type === 'Trailer')
      setTrailerKey(trailer?.key ?? null)
    }).finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="pt-16 min-h-screen">
        <div className="h-[50vh] min-h-[360px] bg-zinc-900 animate-pulse" />
        <div className="px-6 md:px-12 mt-8 space-y-4">
          <div className="h-8 w-64 bg-zinc-800 rounded animate-pulse" />
          <div className="h-4 w-full max-w-2xl bg-zinc-800 rounded animate-pulse" />
          <div className="h-4 w-3/4 max-w-2xl bg-zinc-800 rounded animate-pulse" />
        </div>
      </div>
    )
  }

  if (!movie) return null

  return (
    <div className="pt-16 min-h-screen">
      <div className="relative h-[50vh] min-h-[360px]">
        <Image
          src={backdropURL(movie.backdrop_path)}
          alt={movie.title}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-black/40 to-transparent" />
      </div>

      <div className="px-6 md:px-12 -mt-32 relative z-10">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="shrink-0">
            <div className="relative w-48 h-72 md:w-56 md:h-84 rounded-lg overflow-hidden shadow-2xl">
              <Image
                src={posterURL(movie.poster_path, 'w342')}
                alt={movie.title}
                fill
                className="object-cover"
                sizes="224px"
              />
            </div>
          </div>

          <div className="flex-1 pt-8 md:pt-32">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-1">{movie.title}</h1>
            {movie.tagline && <p className="text-zinc-400 italic mb-3">{movie.tagline}</p>}
            <div className="flex items-center flex-wrap gap-3 mb-4">
              <RatingBadge rating={movie.vote_average} />
              {movie.release_date && <span className="text-zinc-400 text-sm">{movie.release_date.slice(0, 4)}</span>}
              {movie.runtime && <span className="text-zinc-400 text-sm">{Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m</span>}
              {movie.genres?.map((g) => (
                <span key={g.id} className="text-xs border border-zinc-600 text-zinc-300 px-2 py-0.5 rounded-full">
                  {g.name}
                </span>
              ))}
            </div>
            <p className="text-zinc-300 text-sm leading-relaxed mb-6 max-w-2xl">{movie.overview}</p>
            <MovieDetailClient
              movieId={id}
              movieTitle={movie.title}
              posterPath={movie.poster_path}
              voteAverage={movie.vote_average}
              trailerKey={trailerKey}
            />
          </div>
        </div>

        {credits.cast.length > 0 && (
          <div className="mt-12">
            <CastRow cast={credits.cast} />
          </div>
        )}

        {similar.length > 0 && (
          <div className="mt-12 -mx-6 md:-mx-12">
            <ContentCarousel title="Similar Movies" items={similar} />
          </div>
        )}
      </div>
    </div>
  )
}
