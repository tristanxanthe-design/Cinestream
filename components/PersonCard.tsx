import Link from 'next/link'
import Image from 'next/image'
import type { Person } from '@/lib/tmdb'

interface Props {
  person: Person
}

export function PersonCard({ person }: Props) {
  const profileSrc = person.profile_path
    ? `https://image.tmdb.org/t/p/w185${person.profile_path}`
    : '/placeholder-poster.svg'

  return (
    <Link href={`/person/${person.id}`} className="flex flex-col items-center gap-2 group shrink-0">
      <div className="relative w-24 h-24 rounded-full overflow-hidden bg-zinc-800">
        <Image
          src={profileSrc}
          alt={person.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-200"
          sizes="96px"
        />
      </div>
      <div className="text-center w-24">
        <p className="text-white text-xs font-medium truncate">{person.name}</p>
        <p className="text-zinc-400 text-xs truncate">{person.known_for_department}</p>
      </div>
    </Link>
  )
}
