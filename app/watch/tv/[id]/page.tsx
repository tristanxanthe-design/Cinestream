import { notFound } from 'next/navigation'
import { getDetails, getSeasonDetails } from '@/lib/tmdb'
import { Player } from '@/components/Player'
import { BackButton } from '@/components/BackButton'
import type { TVShow } from '@/lib/types'
import { TVWatchClient } from './TVWatchClient'

interface Props {
  params: { id: string }
  searchParams: { s?: string; e?: string }
}

export default async function WatchTVPage({ params, searchParams }: Props) {
  const id = Number(params.id)
  const season = Number(searchParams.s ?? 1)
  const episode = Number(searchParams.e ?? 1)
  if (isNaN(id)) notFound()

  const [show, seasonData] = await Promise.all([
    getDetails('tv', id).catch(() => null),
    getSeasonDetails(id, season).catch(() => null),
  ])

  if (!show) notFound()
  const s = show as TVShow

  return (
    <div className="pt-16 min-h-screen bg-[#141414]">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="mb-4">
          <BackButton />
        </div>
        <Player type="tv" id={id} season={season} episode={episode} />
        <TVWatchClient
          tvId={id}
          tvName={s.name}
          posterPath={s.poster_path}
          season={season}
          episode={episode}
          episodes={seasonData?.episodes ?? []}
          overview={s.overview}
        />
      </div>
    </div>
  )
}
