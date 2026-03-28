import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getUpcoming } from '@/lib/tmdb'
import { posterURL } from '@/lib/constants'

export const metadata = { title: 'Upcoming — CineStream' }

export default async function UpcomingPage() {
  const data = await getUpcoming().catch(() => null)
  if (!data) notFound()

  const today = new Date().toISOString().slice(0, 10) // 'YYYY-MM-DD'

  // Sort by release_date ascending
  const sorted = [...data.results].sort((a, b) => {
    const aDate = a.release_date ?? '9999-12-31'
    const bDate = b.release_date ?? '9999-12-31'
    return aDate.localeCompare(bDate)
  })

  return (
    <div className="pt-20 min-h-screen px-6 md:px-12">
      <h1 className="text-3xl font-bold text-white mb-8">Upcoming Releases</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {sorted.map(movie => {
          const isComingSoon = !movie.release_date || movie.release_date > today
          return (
            <Link key={movie.id} href={`/movie/${movie.id}`} className="group block">
              <div className="relative aspect-[2/3] bg-zinc-800 rounded-lg overflow-hidden mb-2">
                <Image
                  src={posterURL(movie.poster_path)}
                  alt={movie.title}
                  fill
                  loading="lazy"
                  className="object-cover group-hover:scale-105 transition-transform duration-200"
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 17vw"
                />
                {isComingSoon && (
                  <div className="absolute top-2 left-2">
                    <span className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded">
                      Coming Soon
                    </span>
                  </div>
                )}
              </div>
              <p className="text-sm font-medium text-white truncate">{movie.title}</p>
              {movie.release_date && (
                <p className="text-xs text-zinc-400 mt-0.5">{movie.release_date}</p>
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
