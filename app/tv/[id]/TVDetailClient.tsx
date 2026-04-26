'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Play, Heart, Youtube } from 'lucide-react'
import { useWatchlist } from '@/context/WatchlistContext'
import { TrailerModal } from '@/components/TrailerModal'
import { AddToListButton } from '@/components/AddToListButton'
import { CastRow } from '@/components/CastRow'
import { backdropURL, posterURL } from '@/lib/constants'
import { getSeasonDetails } from '@/lib/tmdb'
import type { TVShow, Season, Episode, Cast, MediaItem } from '@/lib/types'

interface Props {
  tvId: number
  tvName: string
  posterPath: string | null
  voteAverage: number
  trailerKey: string | null
  show: TVShow & { seasons?: Season[] }
  credits: { cast: Cast[] }
  similar: MediaItem[]
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <h2
        style={{
          fontFamily: 'Instrument Sans,sans-serif',
          fontWeight: 700,
          fontSize: 15,
          letterSpacing: '0.08em',
          textTransform: 'uppercase' as const,
        }}
        className="text-white whitespace-nowrap"
      >
        {title}
      </h2>
      <div className="hairline flex-1" />
    </div>
  )
}

function EpisodeList({
  tvId,
  seasonNumber,
}: {
  tvId: number
  seasonNumber: number
}) {
  const [episodes, setEpisodes] = useState<Episode[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    setEpisodes([])
    getSeasonDetails(tvId, seasonNumber)
      .then((data) => setEpisodes(data.episodes ?? []))
      .catch(() => setEpisodes([]))
      .finally(() => setLoading(false))
  }, [tvId, seasonNumber])

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton h-[76px] rounded-xl" />
        ))}
      </div>
    )
  }

  if (!episodes.length) {
    return (
      <p
        className="body-text"
        style={{ color: 'rgba(255,255,255,0.3)', paddingTop: 8 }}
      >
        No episodes available.
      </p>
    )
  }

  return (
    <div>
      {episodes.map((ep) => (
        <Link
          key={ep.id}
          href={`/watch/tv/${tvId}?s=${seasonNumber}&e=${ep.episode_number}`}
          className="flex gap-3 p-3 mb-2 glass rounded-xl group transition-opacity hover:opacity-80"
          style={{ textDecoration: 'none' }}
        >
          {/* Thumbnail */}
          <div className="relative shrink-0 w-[120px] h-[68px] rounded-lg overflow-hidden bg-white/5">
            {ep.still_path ? (
              <Image
                src={`https://image.tmdb.org/t/p/w300${ep.still_path}`}
                alt={ep.name}
                fill
                className="object-cover img-reveal"
                sizes="120px"
                onLoad={(e) =>
                  (e.target as HTMLImageElement).classList.add('loaded')
                }
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Play
                  size={20}
                  style={{ color: 'rgba(255,255,255,0.2)' }}
                />
              </div>
            )}
          </div>

          {/* Meta */}
          <div className="flex-1 min-w-0 flex flex-col justify-center gap-0.5">
            <span
              className="label-small"
              style={{ color: 'rgba(255,255,255,0.4)', display: 'block' }}
            >
              E{ep.episode_number}
            </span>
            <p
              className="text-white truncate"
              style={{
                fontFamily: 'Instrument Sans,sans-serif',
                fontWeight: 700,
                fontSize: 13,
              }}
            >
              {ep.name}
            </p>
            {ep.overview && (
              <p
                style={{
                  fontFamily: 'Instrument Sans,sans-serif',
                  fontSize: 12,
                  color: 'rgba(255,255,255,0.3)',
                  lineHeight: 1.5,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical' as const,
                  overflow: 'hidden',
                }}
              >
                {ep.overview}
              </p>
            )}
          </div>
        </Link>
      ))}
    </div>
  )
}

export function TVDetailClient({
  tvId,
  tvName,
  posterPath,
  voteAverage,
  trailerKey,
  show,
  credits,
  similar,
}: Props) {
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist()
  const [showTrailer, setShowTrailer] = useState(false)
  const inList = isInWatchlist(tvId)

  const validSeasons = (show.seasons ?? []).filter(
    (s) => s.season_number > 0
  )
  const [activeSeason, setActiveSeason] = useState<number>(
    validSeasons[0]?.season_number ?? 1
  )

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

  const year = show.first_air_date?.slice(0, 4)
  const seasonCount = show.number_of_seasons
  const rating = show.vote_average ? show.vote_average.toFixed(1) : null

  return (
    <>
      {/* Backdrop */}
      <div className="relative h-[60vh]">
        <Image
          src={backdropURL(show.backdrop_path)}
          alt={show.name}
          fill
          priority
          className="object-cover img-reveal"
          sizes="100vw"
          onLoad={(e) => (e.target as HTMLImageElement).classList.add('loaded')}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to bottom,rgba(3,3,5,0.2) 0%,rgba(3,3,5,0.7) 60%,#030305 100%)',
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to right,rgba(3,3,5,0.8),transparent 60%)',
          }}
        />
      </div>

      {/* Content */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 -mt-28 relative z-10">
        <div className="flex gap-8 items-start">
          {/* Poster */}
          <div
            className="hidden md:block shrink-0 w-[200px]"
            style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}
          >
            <div className="relative w-[200px] aspect-[2/3] rounded-2xl overflow-hidden">
              <Image
                src={posterURL(show.poster_path, 'w342')}
                alt={show.name}
                fill
                className="object-cover img-reveal"
                sizes="200px"
                onLoad={(e) =>
                  (e.target as HTMLImageElement).classList.add('loaded')
                }
              />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 pt-4">
            {/* Meta chips */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {year && (
                <span
                  className="glass label-small"
                  style={{ padding: '4px 10px', borderRadius: 100 }}
                >
                  {year}
                </span>
              )}
              {seasonCount && (
                <span
                  className="glass label-small"
                  style={{ padding: '4px 10px', borderRadius: 100 }}
                >
                  {seasonCount} Season{seasonCount !== 1 ? 's' : ''}
                </span>
              )}
              {rating && (
                <span
                  className="label-small"
                  style={{
                    padding: '4px 10px',
                    borderRadius: 100,
                    background: 'rgba(34,197,94,0.15)',
                    color: '#4ade80',
                    border: '1px solid rgba(34,197,94,0.25)',
                  }}
                >
                  ★ {rating}
                </span>
              )}
              {show.genres?.map((g) => (
                <span
                  key={g.id}
                  className="glass label-small"
                  style={{ padding: '4px 10px', borderRadius: 100 }}
                >
                  {g.name}
                </span>
              ))}
            </div>

            {/* Title */}
            <h1
              style={{
                fontFamily: 'Playfair Display,Georgia,serif',
                fontWeight: 900,
                fontSize: 'clamp(28px,4vw,40px)',
                letterSpacing: '-1.5px',
                lineHeight: 1.1,
                marginBottom: 16,
                color: '#fff',
              }}
            >
              {show.name}
            </h1>

            {/* Tagline */}
            {show.tagline && (
              <p
                className="label-small mb-3"
                style={{
                  color: 'rgba(255,255,255,0.4)',
                  fontStyle: 'italic',
                }}
              >
                {show.tagline}
              </p>
            )}

            {/* Overview */}
            <p className="body-text max-w-2xl mb-6">{show.overview}</p>

            {/* Buttons */}
            <div className="flex flex-wrap gap-3 mb-8">
              <Link
                href={`/watch/tv/${tvId}?s=${activeSeason}&e=1`}
                className="btn-watch"
              >
                <Play size={16} fill="currentColor" />
                Watch Now
              </Link>
              <button
                onClick={toggleWatchlist}
                className="btn-list"
                aria-label={inList ? 'Remove from watchlist' : 'Add to watchlist'}
                style={
                  inList
                    ? { color: '#e50914', borderColor: 'rgba(229,9,20,0.4)' }
                    : undefined
                }
              >
                <Heart size={16} fill={inList ? 'currentColor' : 'none'} />
                {inList ? 'In Watchlist' : 'Watchlist'}
              </button>
              <AddToListButton
                itemId={tvId}
                itemType="tv"
                itemTitle={tvName}
                posterPath={posterPath}
              />
              {trailerKey && (
                <button
                  onClick={() => setShowTrailer(true)}
                  className="btn-list"
                >
                  <Youtube size={16} />
                  Trailer
                </button>
              )}
            </div>

            {/* Season tabs + episodes */}
            {validSeasons.length > 0 && (
              <div className="mb-8">
                <SectionHeader title="Episodes" />

                {/* Season tabs */}
                <div className="flex flex-wrap gap-2 mb-5">
                  {validSeasons.map((s) => (
                    <button
                      key={s.season_number}
                      onClick={() => setActiveSeason(s.season_number)}
                      style={
                        activeSeason === s.season_number
                          ? {
                              background: 'white',
                              color: '#030305',
                              borderRadius: 100,
                              padding: '8px 16px',
                              fontFamily: 'Instrument Sans,sans-serif',
                              fontWeight: 700,
                              fontSize: 13,
                              border: 'none',
                              cursor: 'pointer',
                            }
                          : {
                              background: 'var(--glass-bg)',
                              color: 'rgba(255,255,255,0.5)',
                              borderRadius: 100,
                              padding: '8px 16px',
                              fontFamily: 'Instrument Sans,sans-serif',
                              fontWeight: 500,
                              fontSize: 13,
                              border: '1px solid var(--glass-border)',
                              cursor: 'pointer',
                            }
                      }
                    >
                      Season {s.season_number}
                    </button>
                  ))}
                </div>

                {/* Episode list */}
                <EpisodeList tvId={tvId} seasonNumber={activeSeason} />
              </div>
            )}

            {/* Cast */}
            {credits.cast.length > 0 && (
              <div className="mb-8">
                <SectionHeader title="Cast" />
                <CastRow cast={credits.cast} />
              </div>
            )}
          </div>
        </div>

        {/* More Like This */}
        {similar.length > 0 && (
          <div className="mt-16 mb-12">
            <SectionHeader title="More Like This" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {similar.slice(0, 10).map((item) => {
                const itemTitle =
                  item.media_type === 'tv'
                    ? (item as any).name
                    : (item as any).title
                return (
                  <Link
                    key={item.id}
                    href={`/tv/${item.id}`}
                    className="card-media block group"
                  >
                    <div className="relative aspect-[2/3] rounded-[14px] overflow-hidden">
                      <Image
                        src={posterURL(item.poster_path, 'w342')}
                        alt={itemTitle ?? ''}
                        fill
                        className="object-cover img-reveal"
                        sizes="(max-width:640px) 50vw,(max-width:1024px) 33vw,20vw"
                        onLoad={(e) =>
                          (e.target as HTMLImageElement).classList.add('loaded')
                        }
                      />
                    </div>
                    <p
                      className="mt-2 text-white truncate"
                      style={{
                        fontFamily: 'Instrument Sans,sans-serif',
                        fontSize: 13,
                        fontWeight: 600,
                      }}
                    >
                      {itemTitle}
                    </p>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {showTrailer && trailerKey && (
        <TrailerModal videoKey={trailerKey} onClose={() => setShowTrailer(false)} />
      )}
    </>
  )
}
