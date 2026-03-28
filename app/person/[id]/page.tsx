import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getPersonDetails, getPersonCredits } from '@/lib/tmdb'
import { posterURL } from '@/lib/constants'

interface Props { params: { id: string } }

export default async function PersonPage({ params }: Props) {
  const id = Number(params.id)
  if (isNaN(id)) notFound()

  const [person, credits] = await Promise.all([
    getPersonDetails(id).catch(() => null),
    getPersonCredits(id).catch(() => ({ cast: [] })),
  ])

  if (!person) notFound()

  // Sort by popularity, deduplicate by id
  const seen = new Set<number>()
  const filmography = credits.cast
    .filter(c => (c.media_type === 'movie' || c.media_type === 'tv') && c.poster_path)
    .filter(c => { if (seen.has(c.id)) return false; seen.add(c.id); return true })
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, 40)

  const profileSrc = person.profile_path
    ? `https://image.tmdb.org/t/p/w342${person.profile_path}`
    : '/placeholder-poster.svg'

  return (
    <div className="pt-20 min-h-screen px-6 md:px-12">
      {/* Person header */}
      <div className="flex flex-col md:flex-row gap-8 mb-12">
        <div className="shrink-0">
          <div className="relative w-48 h-48 rounded-full overflow-hidden">
            <Image src={profileSrc} alt={person.name} fill className="object-cover" sizes="192px" />
          </div>
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-white mb-2">{person.name}</h1>
          <p className="text-zinc-400 text-sm mb-1">{person.known_for_department}</p>
          {person.birthday && (
            <p className="text-zinc-400 text-sm mb-1">
              Born: {person.birthday}{person.place_of_birth ? ` in ${person.place_of_birth}` : ''}
            </p>
          )}
          {person.biography && (
            <p className="text-zinc-300 text-sm leading-relaxed mt-4 max-w-3xl line-clamp-6">
              {person.biography}
            </p>
          )}
        </div>
      </div>

      {/* Filmography */}
      {filmography.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Filmography</h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-4">
            {filmography.map(credit => (
              <Link key={`${credit.id}-${credit.media_type}`} href={`/${credit.media_type}/${credit.id}`} className="group block">
                <div className="relative aspect-[2/3] bg-zinc-800 rounded-lg overflow-hidden mb-1">
                  <Image
                    src={posterURL(credit.poster_path)}
                    alt={credit.title || credit.name || ''}
                    fill
                    loading="lazy"
                    className="object-cover group-hover:scale-105 transition-transform duration-200"
                    sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, 12vw"
                  />
                </div>
                <p className="text-xs text-zinc-300 truncate">{credit.title || credit.name}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
