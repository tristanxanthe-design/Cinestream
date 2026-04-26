'use client'
import { useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, PlayCircle } from 'lucide-react'
import { useWatchlist } from '@/context/WatchlistContext'
import { useProgress } from '@/context/ProgressContext'
import type { Episode, Season } from '@/lib/types'
import { WatchPageShortcuts } from '@/components/WatchPageShortcuts'

interface Props {
  tvId: number
  tvName: string
  posterPath: string | null
  season: number
  episode: number
  episodes: Episode[]
  seasons: Season[]
  overview: string
}

export function TVWatchClient({ tvId, tvName, posterPath, season, episode, episodes, seasons, overview }: Props) {
  const { addToHistory } = useWatchlist()
  const { markWatched } = useProgress()
  const activeEpRef = useRef<HTMLAnchorElement>(null)

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

  // Scroll active episode into view when episodes load
  useEffect(() => {
    if (activeEpRef.current) {
      activeEpRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
    }
  }, [episodes, episode])

  return (
    <div>
      <WatchPageShortcuts />

      {/* ── Prev / Next bar — sits directly below the player ── */}
      <div className="flex items-center gap-3 bg-zinc-900/80 border border-zinc-800 rounded-xl px-4 py-2.5 mt-3 mb-6">
        {prevEp ? (
          <Link
            href={`/watch/tv/${tvId}?s=${season}&e=${prevEp.episode_number}`}
            className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors text-sm group"
          >
            <ChevronLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
            <span className="hidden sm:inline">E{prevEp.episode_number}:</span>
            <span className="truncate max-w-[140px] hidden sm:inline">{prevEp.name}</span>
            <span className="sm:hidden">Previous</span>
          </Link>
        ) : <div className="flex-1" />}

        <div className="flex-1 text-center">
          <p className="text-white text-sm font-semibold truncate">{tvName}</p>
          {currentEp && (
            <p className="text-zinc-500 text-xs truncate">S{season} E{episode} · {currentEp.name}</p>
          )}
        </div>

        {nextEp ? (
          <Link
            href={`/watch/tv/${tvId}?s=${season}&e=${nextEp.episode_number}`}
            className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors text-sm group text-right"
          >
            <span className="truncate max-w-[140px] hidden sm:inline">{nextEp.name}</span>
            <span className="hidden sm:inline">:E{nextEp.episode_number}</span>
            <span className="sm:hidden">Next</span>
            <ChevronRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        ) : <div className="flex-1" />}
      </div>

      {/* ── Show title & episode overview ── */}
      <h1 className="text-xl font-bold text-white mb-1">{tvName}</h1>
      {currentEp && (
        <p className="text-zinc-400 text-sm mb-1.5">
          Season {season} · Episode {episode}: <span className="text-zinc-300">{currentEp.name}</span>
        </p>
      )}
      <p className="text-zinc-500 text-sm leading-relaxed max-w-3xl mb-8">
        {currentEp?.overview || overview}
      </p>

      {/* ── Season selector ── */}
      {seasons.length > 0 && (
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-3">Season</p>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {seasons.map((s) => (
              <Link
                key={s.season_number}
                href={`/watch/tv/${tvId}?s=${s.season_number}&e=1`}
                className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-150 ${
                  s.season_number === season
                    ? 'bg-red-600 text-white shadow-lg shadow-red-900/40'
                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
                }`}
              >
                S{s.season_number}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── Episode list ── */}
      {episodes.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-3">
            Episodes — Season {season}
          </p>

          {/* Horizontal scroll container */}
          <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-thin scrollbar-track-zinc-900 scrollbar-thumb-zinc-700">
            {episodes.map((ep) => {
              const isActive = ep.episode_number === episode
              return (
                <Link
                  key={ep.id}
                  ref={isActive ? activeEpRef : null}
                  href={`/watch/tv/${tvId}?s=${season}&e=${ep.episode_number}`}
                  className={`group shrink-0 w-52 rounded-lg overflow-hidden transition-all duration-150 ${
                    isActive
                      ? 'ring-2 ring-red-500 ring-offset-2 ring-offset-[#141414]'
                      : 'hover:ring-1 hover:ring-zinc-600 ring-offset-2 ring-offset-[#141414]'
                  }`}
                >
                  {/* Thumbnail */}
                  <div className="relative w-full aspect-video bg-zinc-800">
                    {ep.still_path ? (
                      <Image
                        src={`https://image.tmdb.org/t/p/w300${ep.still_path}`}
                        alt={ep.name}
                        fill
                        sizes="208px"
                        className={`object-cover transition-opacity duration-200 ${isActive ? 'opacity-60' : 'group-hover:opacity-80'}`}
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-3xl font-black text-zinc-700">{ep.episode_number}</span>
                      </div>
                    )}

                    {/* Active indicator */}
                    {isActive && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <PlayCircle size={32} className="text-white drop-shadow-lg" />
                      </div>
                    )}

                    {/* Episode number badge */}
                    <div className="absolute top-1.5 left-1.5 bg-black/70 backdrop-blur-sm text-white text-xs font-bold px-1.5 py-0.5 rounded">
                      E{ep.episode_number}
                    </div>
                  </div>

                  {/* Info */}
                  <div className={`px-2.5 py-2 transition-colors ${isActive ? 'bg-red-950/40' : 'bg-zinc-900 group-hover:bg-zinc-800'}`}>
                    <p className={`text-xs font-semibold leading-snug line-clamp-2 ${isActive ? 'text-white' : 'text-zinc-300 group-hover:text-white'}`}>
                      {ep.name}
                    </p>
                    {ep.vote_average > 0 && (
                      <p className="text-zinc-600 text-xs mt-0.5">★ {ep.vote_average.toFixed(1)}</p>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
