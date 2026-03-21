import { notFound } from 'next/navigation'
import { getDetails } from '@/lib/tmdb'
import { Player } from '@/components/Player'
import { BackButton } from '@/components/BackButton'
import type { Movie } from '@/lib/types'
import { MovieWatchClient } from './MovieWatchClient'

interface Props { params: { id: string } }

export async function generateMetadata({ params }: Props) {
  const movie = await getDetails('movie', Number(params.id)).catch(() => null) as Movie | null
  return { title: movie ? `Watch ${movie.title} — CineStream` : 'Watch — CineStream' }
}

export default async function WatchMoviePage({ params }: Props) {
  const id = Number(params.id)
  if (isNaN(id)) notFound()

  const movie = await getDetails('movie', id).catch(() => null) as Movie | null
  if (!movie) notFound()

  return (
    <div className="pt-16 min-h-screen bg-[#141414]">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="mb-4">
          <BackButton />
        </div>
        <Player type="movie" id={id} />
        <MovieWatchClient
          movieId={id}
          movieTitle={movie.title}
          posterPath={movie.poster_path}
          overview={movie.overview}
        />
      </div>
    </div>
  )
}
