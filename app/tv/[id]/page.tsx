import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getDetails, getCredits, getSimilar, getVideos } from '@/lib/tmdb'
import { backdropURL, posterURL } from '@/lib/constants'
import { RatingBadge } from '@/components/RatingBadge'
import { CastRow } from '@/components/CastRow'
import { SeasonPicker } from '@/components/SeasonPicker'
import { ContentCarousel } from '@/components/ContentCarousel'
import type { TVShow, Season, MediaItem } from '@/lib/types'
import { TVDetailClient } from './TVDetailClient'

interface Props { params: { id: string } }

export async function generateMetadata({ params }: Props) {
  const show = await getDetails('tv', Number(params.id)).catch(() => null) as TVShow | null
  return { title: show ? `${show.name} — CineStream` : 'TV Show — CineStream' }
}

export default async function TVDetailPage({ params }: Props) {
  const id = Number(params.id)
  if (isNaN(id)) notFound()

  const [show, credits, similar, videos] = await Promise.all([
    getDetails('tv', id).catch(() => null),
    getCredits('tv', id).catch(() => ({ cast: [] })),
    getSimilar('tv', id).catch(() => ({ results: [] })),
    getVideos('tv', id).catch(() => ({ results: [] })),
  ])

  if (!show) notFound()
  const s = show as TVShow & { seasons?: Season[] }
  const trailer = videos.results.find((v) => v.site === 'YouTube' && v.type === 'Trailer')
  const similarItems: MediaItem[] = similar.results.slice(0, 20).map((i: any) => ({ ...i, media_type: 'tv' as const }))

  return (
    <div className="pt-16 min-h-screen">
      <div className="relative h-[50vh] min-h-[360px]">
        <Image src={backdropURL(s.backdrop_path)} alt={s.name} fill priority className="object-cover" sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-black/40 to-transparent" />
      </div>

      <div className="px-6 md:px-12 -mt-32 relative z-10">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="shrink-0">
            <div className="relative w-48 h-72 md:w-56 md:h-84 rounded-lg overflow-hidden shadow-2xl">
              <Image src={posterURL(s.poster_path, 'w342')} alt={s.name} fill className="object-cover" sizes="224px" />
            </div>
          </div>
          <div className="flex-1 pt-8 md:pt-32">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-1">{s.name}</h1>
            {s.tagline && <p className="text-zinc-400 italic mb-3">{s.tagline}</p>}
            <div className="flex items-center flex-wrap gap-3 mb-4">
              <RatingBadge rating={s.vote_average} />
              {s.first_air_date && <span className="text-zinc-400 text-sm">{s.first_air_date.slice(0, 4)}</span>}
              {s.number_of_seasons && <span className="text-zinc-400 text-sm">{s.number_of_seasons} Season{s.number_of_seasons !== 1 ? 's' : ''}</span>}
              {s.genres?.map((g) => (
                <span key={g.id} className="text-xs border border-zinc-600 text-zinc-300 px-2 py-0.5 rounded-full">{g.name}</span>
              ))}
            </div>
            <p className="text-zinc-300 text-sm leading-relaxed mb-6 max-w-2xl">{s.overview}</p>
            <TVDetailClient
              tvId={id}
              tvName={s.name}
              posterPath={s.poster_path}
              voteAverage={s.vote_average}
              trailerKey={trailer?.key ?? null}
            />
          </div>
        </div>

        {s.seasons && s.seasons.length > 0 && (
          <div className="mt-12">
            <h3 className="text-lg font-bold text-white mb-4">Episodes</h3>
            <SeasonPicker tvId={id} seasons={s.seasons} />
          </div>
        )}

        {credits.cast.length > 0 && (
          <div className="mt-12">
            <CastRow cast={credits.cast} />
          </div>
        )}

        {similarItems.length > 0 && (
          <div className="mt-12 -mx-6 md:-mx-12">
            <ContentCarousel title="Similar Shows" items={similarItems} />
          </div>
        )}
      </div>
    </div>
  )
}
