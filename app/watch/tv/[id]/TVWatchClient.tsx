'use client'
import { useEffect } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useWatchlist } from '@/context/WatchlistContext'
import { useProgress } from '@/context/ProgressContext'
import type { Episode } from '@/lib/types'
import { WatchPageShortcuts } from '@/components/WatchPageShortcuts'

interface Props {
  tvId: number
  tvName: string
  posterPath: string | null
  season: number
  episode: number
  episodes: Episode[]
  overview: string
}

export function TVWatchClient({ tvId, tvName, posterPath, season, episode, episodes, overview }: Props) {
  const { addToHistory } = useWatchlist()
  const { markWatched } = useProgress()
  const currentEp = episodes.find((e) => e.episode_number === episode)
  const prevEp = episodes.find((e) => e.episode_number === episode - 1)
  const nextEp = episodes.find((e) => e.episode_number === episode + 1)

  useEffect(() => {
    addToHistory({
      id: tvId, type: 'tv', title: tvName,
      poster_path: posterPath, season, episode,
      watchedAt: new Date().toISOString(),
    })
    markWatched(tvId, season, episode)
  }, [tvId, season, episode]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="mt-6">
      <WatchPageShortcuts />
      <h1 className="text-2xl font-bold text-white mb-1">{tvName}</h1>
      {currentEp && (
        <p className="text-zinc-400 text-sm mb-2">
          Season {season} · Episode {episode}: {currentEp.name}
        </p>
      )}
      <p className="text-zinc-400 text-sm leading-relaxed max-w-3xl mb-6">
        {currentEp?.overview || overview}
      </p>

      {/* Prev / Next navigation */}
      <div className="flex gap-3 mb-8">
        {prevEp && (
          <Link
            href={`/watch/tv/${tvId}?s=${season}&e=${prevEp.episode_number}`}
            className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-md transition-colors text-sm"
          >
            <ChevronLeft size={16} /> Previous Episode
          </Link>
        )}
        {nextEp && (
          <Link
            href={`/watch/tv/${tvId}?s=${season}&e=${nextEp.episode_number}`}
            className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-md transition-colors text-sm"
          >
            Next Episode <ChevronRight size={16} />
          </Link>
        )}
      </div>

      {/* Episode list for current season */}
      {episodes.length > 0 && (
        <div>
          <h3 className="text-base font-bold text-white mb-3">Season {season} Episodes</h3>
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {episodes.map((ep) => (
              <Link
                key={ep.id}
                href={`/watch/tv/${tvId}?s=${season}&e=${ep.episode_number}`}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                  ep.episode_number === episode
                    ? 'bg-red-600/20 text-white border border-red-600/30'
                    : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                }`}
              >
                <span className="shrink-0 w-6 text-zinc-500 text-xs">{ep.episode_number}</span>
                <span className="truncate">{ep.name}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
