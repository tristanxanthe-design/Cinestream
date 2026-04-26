'use client'
import { useState, useEffect, Suspense } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { getDetails, getSeasonDetails } from '@/lib/tmdb'
import { Player } from '@/components/Player'
import { BackButton } from '@/components/BackButton'
import type { TVShow, Episode } from '@/lib/types'
import { TVWatchClient } from './TVWatchClient'

function WatchTVContent() {
  const params = useParams<{ id: string }>()
  const searchParams = useSearchParams()
  const id = Number(params.id)
  const season = Number(searchParams.get('s') ?? 1)
  const episode = Number(searchParams.get('e') ?? 1)

  const [show, setShow] = useState<TVShow | null>(null)
  const [episodes, setEpisodes] = useState<Episode[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isNaN(id)) return
    Promise.all([
      getDetails('tv', id).catch(() => null),
      getSeasonDetails(id, season).catch(() => null),
    ]).then(([showData, seasonData]) => {
      setShow(showData as TVShow)
      setEpisodes(seasonData?.episodes ?? [])
    }).finally(() => setLoading(false))
  }, [id, season])

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

  if (!show) return null

  return (
    <div className="pt-16 min-h-screen bg-[#141414]">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="mb-4">
          <BackButton />
        </div>
        <Player type="tv" id={id} season={season} episode={episode} />
        <TVWatchClient
          tvId={id}
          tvName={show.name}
          posterPath={show.poster_path}
          season={season}
          episode={episode}
          episodes={episodes}
          seasons={(show.seasons ?? []).filter((s) => s.season_number > 0 && s.episode_count > 0)}
          overview={show.overview}
          voteAverage={show.vote_average}
        />
      </div>
    </div>
  )
}

export default function WatchTVPage() {
  return (
    <Suspense fallback={
      <div className="pt-16 min-h-screen bg-[#141414]">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="w-full aspect-video bg-zinc-900 rounded-lg animate-pulse" />
        </div>
      </div>
    }>
      <WatchTVContent />
    </Suspense>
  )
}
