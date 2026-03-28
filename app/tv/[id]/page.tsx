'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import { getDetails, getCredits, getSimilar, getVideos } from '@/lib/tmdb'
import { backdropURL, posterURL } from '@/lib/constants'
import { RatingBadge } from '@/components/RatingBadge'
import { CastRow } from '@/components/CastRow'
import { SeasonPicker } from '@/components/SeasonPicker'
import { ContentCarousel } from '@/components/ContentCarousel'
import type { TVShow, Season, Cast, MediaItem, Video } from '@/lib/types'
import { TVDetailClient } from './TVDetailClient'

type TVShowWithSeasons = TVShow & { seasons?: Season[] }

export default function TVDetailPage() {
  const params = useParams<{ id: string }>()
  const id = Number(params.id)

  const [show, setShow] = useState<TVShowWithSeasons | null>(null)
  const [credits, setCredits] = useState<{ cast: Cast[] }>({ cast: [] })
  const [similar, setSimilar] = useState<MediaItem[]>([])
  const [trailerKey, setTrailerKey] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isNaN(id)) return
    Promise.all([
      getDetails('tv', id).catch(() => null),
      getCredits('tv', id).catch(() => ({ cast: [] })),
      getSimilar('tv', id).catch(() => ({ results: [] })),
      getVideos('tv', id).catch(() => ({ results: [] })),
    ]).then(([showData, creditsData, similarData, videosData]) => {
      setShow(showData as TVShowWithSeasons)
      setCredits(creditsData)
      setSimilar(similarData.results.slice(0, 20).map((i: any) => ({ ...i, media_type: 'tv' as const })))
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

  if (!show) return null

  return (
    <div className="pt-16 min-h-screen">
      <div className="relative h-[50vh] min-h-[360px]">
        <Image src={backdropURL(show.backdrop_path)} alt={show.name} fill priority className="object-cover" sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-black/40 to-transparent" />
      </div>

      <div className="px-6 md:px-12 -mt-32 relative z-10">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="shrink-0">
            <div className="relative w-48 h-72 md:w-56 md:h-84 rounded-lg overflow-hidden shadow-2xl">
              <Image src={posterURL(show.poster_path, 'w342')} alt={show.name} fill className="object-cover" sizes="224px" />
            </div>
          </div>
          <div className="flex-1 pt-8 md:pt-32">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-1">{show.name}</h1>
            {show.tagline && <p className="text-zinc-400 italic mb-3">{show.tagline}</p>}
            <div className="flex items-center flex-wrap gap-3 mb-4">
              <RatingBadge rating={show.vote_average} />
              {show.first_air_date && <span className="text-zinc-400 text-sm">{show.first_air_date.slice(0, 4)}</span>}
              {show.number_of_seasons && <span className="text-zinc-400 text-sm">{show.number_of_seasons} Season{show.number_of_seasons !== 1 ? 's' : ''}</span>}
              {show.genres?.map((g) => (
                <span key={g.id} className="text-xs border border-zinc-600 text-zinc-300 px-2 py-0.5 rounded-full">{g.name}</span>
              ))}
            </div>
            <p className="text-zinc-300 text-sm leading-relaxed mb-6 max-w-2xl">{show.overview}</p>
            <TVDetailClient
              tvId={id}
              tvName={show.name}
              posterPath={show.poster_path}
              voteAverage={show.vote_average}
              trailerKey={trailerKey}
            />
          </div>
        </div>

        {show.seasons && show.seasons.length > 0 && (
          <div className="mt-12">
            <h3 className="text-lg font-bold text-white mb-4">Episodes</h3>
            <SeasonPicker tvId={id} seasons={show.seasons} />
          </div>
        )}

        {credits.cast.length > 0 && (
          <div className="mt-12">
            <CastRow cast={credits.cast} />
          </div>
        )}

        {similar.length > 0 && (
          <div className="mt-12 -mx-6 md:-mx-12">
            <ContentCarousel title="Similar Shows" items={similar} />
          </div>
        )}
      </div>
    </div>
  )
}
