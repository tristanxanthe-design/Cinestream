'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronDown, CheckCircle } from 'lucide-react'
import type { Season, Episode } from '@/lib/types'
import { getSeasonDetails } from '@/lib/tmdb'
import { posterURL } from '@/lib/constants'
import { useProgress } from '@/context/ProgressContext'

interface SeasonPickerProps {
  tvId: number
  seasons: Season[]
}

export function SeasonPicker({ tvId, seasons }: SeasonPickerProps) {
  const regularSeasons = seasons.filter((s) => s.season_number > 0)
  const [selected, setSelected] = useState(regularSeasons[0]?.season_number ?? 1)
  const [episodes, setEpisodes] = useState<Episode[]>([])
  const [loading, setLoading] = useState(false)
  const { isWatched, getWatchedCount } = useProgress()

  useEffect(() => {
    setLoading(true)
    getSeasonDetails(tvId, selected)
      .then((data) => setEpisodes(data.episodes ?? []))
      .catch(() => setEpisodes([]))
      .finally(() => setLoading(false))
  }, [tvId, selected])

  return (
    <div>
      {/* Season dropdown */}
      <div className="relative inline-block mb-4">
        <select
          value={selected}
          onChange={(e) => setSelected(Number(e.target.value))}
          className="appearance-none bg-zinc-800 text-white border border-zinc-700 rounded-md px-4 py-2 pr-10 text-sm focus:outline-none focus:border-zinc-500 cursor-pointer"
        >
          {regularSeasons.map((s) => (
            <option key={s.season_number} value={s.season_number}>
              {s.name || `Season ${s.season_number}`}
            </option>
          ))}
        </select>
        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
      </div>

      {/* Season progress bar */}
      {!loading && episodes.length > 0 && (() => {
        const watchedCount = getWatchedCount(tvId, selected)
        const pct = Math.round((watchedCount / episodes.length) * 100)
        return (
          <div className="mb-4">
            <p className="text-xs text-zinc-400 mb-1">{watchedCount} / {episodes.length} episodes watched</p>
            <div className="w-full h-1 bg-zinc-800 rounded">
              <div className="h-1 bg-red-600 rounded transition-all" style={{ width: `${pct}%` }} />
            </div>
          </div>
        )
      })()}

      {/* Episode list */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-24 bg-zinc-800 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {episodes.map((ep) => (
            <Link
              key={ep.id}
              href={`/watch/tv/${tvId}?s=${selected}&e=${ep.episode_number}`}
              className="flex gap-3 p-3 bg-zinc-900 hover:bg-zinc-800 rounded-lg transition-colors group"
            >
              <div className="relative shrink-0 w-36 h-20 bg-zinc-800 rounded overflow-hidden">
                <Image
                  src={posterURL(ep.still_path, 'w200')}
                  alt={ep.name}
                  fill
                  loading="lazy"
                  className="object-cover group-hover:scale-105 transition-transform duration-200"
                  sizes="144px"
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-white/20 rounded-full p-2">▶</div>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white mb-1">
                  {ep.episode_number}. {ep.name}
                </p>
                <p className="text-xs text-zinc-400 line-clamp-2">{ep.overview}</p>
                {ep.air_date && <p className="text-xs text-zinc-500 mt-1">{ep.air_date}</p>}
              </div>
              {isWatched(tvId, selected, ep.episode_number) && (
                <CheckCircle size={16} className="text-green-500 shrink-0" />
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
