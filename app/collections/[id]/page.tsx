import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getCollection } from '@/lib/tmdb'
import { backdropURL, posterURL } from '@/lib/constants'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params
  const collection = await getCollection(Number(id)).catch(() => null)
  if (!collection) return { title: 'Collection — CineStream' }
  return { title: `${collection.name} — CineStream` }
}

export default async function CollectionDetailPage({ params }: Props) {
  const { id } = await params
  const collection = await getCollection(Number(id)).catch(() => null)

  if (!collection) notFound()

  const sortedParts = [...collection.parts].sort((a, b) => {
    const yearA = a.release_date ? parseInt(a.release_date.slice(0, 4)) : 9999
    const yearB = b.release_date ? parseInt(b.release_date.slice(0, 4)) : 9999
    return yearA - yearB
  })

  return (
    <main className="pt-16 min-h-screen">
      {/* Backdrop */}
      <div className="relative h-64 w-full bg-zinc-900">
        <Image
          src={backdropURL(collection.backdrop_path)}
          alt={collection.name}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
      </div>

      {/* Info */}
      <div className="px-6 md:px-12 py-8">
        <h1 className="text-3xl font-bold text-white mb-3">{collection.name}</h1>
        {collection.overview && (
          <p className="text-zinc-400 text-sm max-w-3xl leading-relaxed mb-10">
            {collection.overview}
          </p>
        )}

        {/* Movies grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
          {sortedParts.map((movie) => {
            const year = movie.release_date ? movie.release_date.slice(0, 4) : null
            return (
              <Link key={movie.id} href={`/movie/${movie.id}`} className="group">
                <div className="relative aspect-[2/3] bg-zinc-800 rounded-md overflow-hidden mb-2">
                  <Image
                    src={posterURL(movie.poster_path)}
                    alt={movie.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <p className="text-white text-xs font-medium leading-tight line-clamp-2">
                  {movie.title}
                </p>
                {year && (
                  <p className="text-zinc-500 text-xs mt-0.5">{year}</p>
                )}
              </Link>
            )
          })}
        </div>
      </div>
    </main>
  )
}
