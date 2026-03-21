import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getDetails, getCredits, getSimilar, getVideos } from '@/lib/tmdb'
import { backdropURL, posterURL } from '@/lib/constants'
import { RatingBadge } from '@/components/RatingBadge'
import { CastRow } from '@/components/CastRow'
import { ContentCarousel } from '@/components/ContentCarousel'
import type { Movie, MediaItem } from '@/lib/types'
import { MovieDetailClient } from './MovieDetailClient'

interface Props { params: { id: string } }

export async function generateMetadata({ params }: Props) {
  const movie = await getDetails('movie', Number(params.id)).catch(() => null) as Movie | null
  return { title: movie ? `${movie.title} — CineStream` : 'Movie — CineStream' }
}

export default async function MovieDetailPage({ params }: Props) {
  const id = Number(params.id)
  if (isNaN(id)) notFound()

  const [movie, credits, similar, videos] = await Promise.all([
    getDetails('movie', id).catch(() => null),
    getCredits('movie', id).catch(() => ({ cast: [] })),
    getSimilar('movie', id).catch(() => ({ results: [] })),
    getVideos('movie', id).catch(() => ({ results: [] })),
  ])

  if (!movie) notFound()
  const m = movie as Movie
  const trailer = videos.results.find((v) => v.site === 'YouTube' && v.type === 'Trailer')
  const similarItems: MediaItem[] = similar.results.slice(0, 20).map((i: any) => ({ ...i, media_type: 'movie' as const }))

  return (
    <div className="pt-16 min-h-screen">
      {/* Backdrop */}
      <div className="relative h-[50vh] min-h-[360px]">
        <Image
          src={backdropURL(m.backdrop_path)}
          alt={m.title}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-black/40 to-transparent" />
      </div>

      {/* Detail content */}
      <div className="px-6 md:px-12 -mt-32 relative z-10">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster */}
          <div className="shrink-0">
            <div className="relative w-48 h-72 md:w-56 md:h-84 rounded-lg overflow-hidden shadow-2xl">
              <Image
                src={posterURL(m.poster_path, 'w342')}
                alt={m.title}
                fill
                className="object-cover"
                sizes="224px"
              />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 pt-8 md:pt-32">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-1">{m.title}</h1>
            {m.tagline && <p className="text-zinc-400 italic mb-3">{m.tagline}</p>}
            <div className="flex items-center flex-wrap gap-3 mb-4">
              <RatingBadge rating={m.vote_average} />
              {m.release_date && <span className="text-zinc-400 text-sm">{m.release_date.slice(0, 4)}</span>}
              {m.runtime && <span className="text-zinc-400 text-sm">{Math.floor(m.runtime / 60)}h {m.runtime % 60}m</span>}
              {m.genres?.map((g) => (
                <span key={g.id} className="text-xs border border-zinc-600 text-zinc-300 px-2 py-0.5 rounded-full">
                  {g.name}
                </span>
              ))}
            </div>
            <p className="text-zinc-300 text-sm leading-relaxed mb-6 max-w-2xl">{m.overview}</p>
            <MovieDetailClient
              movieId={id}
              movieTitle={m.title}
              posterPath={m.poster_path}
              voteAverage={m.vote_average}
              trailerKey={trailer?.key ?? null}
            />
          </div>
        </div>

        {credits.cast.length > 0 && (
          <div className="mt-12">
            <CastRow cast={credits.cast} />
          </div>
        )}

        {similarItems.length > 0 && (
          <div className="mt-12 -mx-6 md:-mx-12">
            <ContentCarousel title="Similar Movies" items={similarItems} />
          </div>
        )}
      </div>
    </div>
  )
}
