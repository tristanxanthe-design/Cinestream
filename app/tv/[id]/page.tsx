'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { getDetails, getCredits, getSimilar, getVideos } from '@/lib/tmdb'
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
    ])
      .then(([showData, creditsData, similarData, videosData]) => {
        setShow(showData as TVShowWithSeasons)
        setCredits(creditsData)
        setSimilar(
          similarData.results
            .slice(0, 20)
            .map((i: any) => ({ ...i, media_type: 'tv' as const }))
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

  if (!show) return null

  return (
    <div className="min-h-screen" style={{ background: '#030305' }}>
      <TVDetailClient
        tvId={id}
        tvName={show.name}
        posterPath={show.poster_path}
        voteAverage={show.vote_average}
        trailerKey={trailerKey}
        show={show}
        credits={credits}
        similar={similar}
      />
    </div>
  )
}
