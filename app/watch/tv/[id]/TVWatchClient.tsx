'use client'
import { useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, Check } from 'lucide-react'
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
  voteAverage: number
}

export function TVWatchClient({
  tvId,
  tvName,
  posterPath,
  season,
  episode,
  episodes,
  seasons,
  overview,
  voteAverage,
}: Props) {
  const { addToHistory, addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist()
  const { markWatched } = useProgress()
  const activeEpRef = useRef<HTMLAnchorElement>(null)
  const inList = isInWatchlist(tvId)

  const currentEp = episodes.find((e) => e.episode_number === episode)

  useEffect(() => {
    addToHistory({
      id: tvId,
      type: 'tv',
      title: tvName,
      poster_path: posterPath,
      season,
      episode,
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

  function toggleWatchlist() {
    if (inList) {
      removeFromWatchlist(tvId)
    } else {
      addToWatchlist({
        id: tvId,
        type: 'tv',
        title: tvName,
        poster_path: posterPath,
        vote_average: voteAverage,
        addedAt: new Date().toISOString(),
      })
    }
  }

  const rating = voteAverage > 0 ? voteAverage.toFixed(1) : null

  return (
    <div className="max-w-[1400px] mx-auto px-0 py-6">
      <WatchPageShortcuts />

      <div className="flex gap-6 items-start">
        {/* ── Left column: info + servers + season selector ── */}
        <div className="flex-1 min-w-0">
          {/* Glass info panel */}
          <div className="glass glass-blur rounded-[20px] p-6 mb-4">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex-1 min-w-0">
                <h1
                  style={{
                    fontFamily: 'Playfair Display,Georgia,serif',
                    fontWeight: 900,
                    fontSize: 28,
                    letterSpacing: '-1px',
                  }}
                  className="text-white mb-2 leading-tight"
                >
                  {tvName}
                </h1>

                <div className="flex gap-3 items-center flex-wrap">
                  {currentEp && (
                    <>
                      <span className="label-small text-muted">
                        S{season} E{episode}
                      </span>
                      <span className="label-small text-muted">·</span>
                      <span
                        className="label-small"
                        style={{
                          color: 'rgba(255,255,255,0.7)',
                          textTransform: 'none',
                          letterSpacing: 0,
                          fontSize: 12,
                          fontWeight: 500,
                        }}
                      >
                        {currentEp.name}
                      </span>
                      <span className="label-small text-muted">·</span>
                    </>
                  )}
                  {rating && (
                    <span className="label-small" style={{ color: '#46d369' }}>
                      ★ {rating}
                    </span>
                  )}
                </div>

                {(currentEp?.overview || overview) && (
                  <p className="body-text mt-3 max-w-2xl line-clamp-2">
                    {currentEp?.overview || overview}
                  </p>
                )}
              </div>

              <button
                onClick={toggleWatchlist}
                className="btn-list flex-shrink-0 flex items-center gap-2"
                aria-label={inList ? 'Remove from watchlist' : 'Add to watchlist'}
              >
                {inList ? <Check size={16} /> : <Heart size={16} />}
                {inList ? 'Saved' : 'Watchlist'}
              </button>
            </div>
          </div>

          {/* Season pill selector */}
          {seasons.length > 0 && (
            <div className="mb-4">
              <p className="label-small text-muted mb-3">Season</p>
              <div className="flex gap-2 flex-wrap">
                {seasons.map((s) => (
                  <Link
                    key={s.season_number}
                    href={`/watch/tv/${tvId}?s=${s.season_number}&e=1`}
                    className="label-small px-4 py-2 rounded-xl border transition-all"
                    style={
                      s.season_number === season
                        ? {
                            background: 'rgba(229,9,20,0.15)',
                            borderColor: 'rgba(229,9,20,0.3)',
                            color: '#ff6b6b',
                          }
                        : {
                            background: 'var(--glass-bg)',
                            borderColor: 'var(--glass-border)',
                            color: 'rgba(255,255,255,0.5)',
                          }
                    }
                  >
                    S{s.season_number}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Right column: episode sidebar ── */}
        {episodes.length > 0 && (
          <div className="hidden lg:block w-[320px] flex-shrink-0">
            <div className="glass rounded-[16px] overflow-hidden">
              {/* Sidebar header */}
              <div className="p-4 border-b border-[rgba(255,255,255,0.05)]">
                <p className="label-small text-white">Episodes</p>
              </div>

              {/* Scrollable episode list */}
              <div
                className="overflow-y-auto max-h-[60vh]"
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: 'rgba(255,255,255,0.1) transparent',
                }}
              >
                {episodes.map((ep) => {
                  const isActive = ep.episode_number === episode
                  return (
                    <Link
                      key={ep.id}
                      ref={isActive ? activeEpRef : null}
                      href={`/watch/tv/${tvId}?s=${season}&e=${ep.episode_number}`}
                      className="block border-l-2 transition-all"
                      style={{
                        borderLeftColor: isActive ? '#e50914' : 'transparent',
                        background: isActive
                          ? 'rgba(229,9,20,0.05)'
                          : undefined,
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.background = ''
                        }
                      }}
                    >
                      <div className="flex gap-3 p-3">
                        {/* Still thumbnail */}
                        <div className="w-[88px] h-[50px] rounded-lg overflow-hidden flex-shrink-0 bg-[rgba(255,255,255,0.05)]">
                          {ep.still_path ? (
                            <Image
                              src={`https://image.tmdb.org/t/p/w300${ep.still_path}`}
                              alt={ep.name}
                              width={88}
                              height={50}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span
                                style={{
                                  fontFamily: 'Instrument Sans,sans-serif',
                                  fontSize: 16,
                                  fontWeight: 700,
                                  color: 'rgba(255,255,255,0.15)',
                                }}
                              >
                                {ep.episode_number}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Episode info */}
                        <div className="flex-1 min-w-0">
                          <p className="label-small text-muted mb-0.5">
                            E{ep.episode_number}
                          </p>
                          <p
                            className="line-clamp-1"
                            style={{
                              fontFamily: 'Instrument Sans,sans-serif',
                              fontSize: 12,
                              fontWeight: 600,
                              color: '#ffffff',
                            }}
                          >
                            {ep.name}
                          </p>
                          {ep.overview && (
                            <p
                              className="line-clamp-2 mt-0.5"
                              style={{
                                fontSize: 11,
                                color: 'rgba(255,255,255,0.3)',
                                fontFamily: 'Instrument Sans,sans-serif',
                              }}
                            >
                              {ep.overview}
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
