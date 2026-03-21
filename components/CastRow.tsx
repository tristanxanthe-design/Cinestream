import Image from 'next/image'
import type { Cast } from '@/lib/types'
import { posterURL } from '@/lib/constants'

export function CastRow({ cast }: { cast: Cast[] }) {
  if (!cast.length) return null
  return (
    <div>
      <h3 className="text-lg font-bold text-white mb-3">Cast</h3>
      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
        {cast.slice(0, 15).map((member) => (
          <div key={member.id} className="shrink-0 w-24 text-center">
            <div className="relative w-24 h-24 rounded-full overflow-hidden bg-zinc-800 mb-2">
              <Image
                src={posterURL(member.profile_path, 'w200')}
                alt={member.name}
                fill
                loading="lazy"
                className="object-cover"
                sizes="96px"
              />
            </div>
            <p className="text-sm font-medium text-white truncate">{member.name}</p>
            <p className="text-xs text-zinc-400 truncate">{member.character}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
