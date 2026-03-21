import Link from 'next/link'
import Image from 'next/image'
import type { MediaItem } from '@/lib/types'
import { posterURL } from '@/lib/constants'
import { RatingBadge } from './RatingBadge'

interface MediaCardProps {
  item: MediaItem
}

export function MediaCard({ item }: MediaCardProps) {
  const isMovie = item.media_type === 'movie'
  const title = isMovie ? item.title : item.name
  const href = `/${isMovie ? 'movie' : 'tv'}/${item.id}`

  return (
    <Link href={href} className="group shrink-0 w-36 md:w-44 block">
      <div className="relative aspect-[2/3] bg-zinc-800 rounded-lg overflow-hidden mb-2">
        <Image
          src={posterURL(item.poster_path)}
          alt={title}
          fill
          loading="lazy"
          className="object-cover group-hover:scale-105 transition-transform duration-200"
          sizes="(max-width: 768px) 144px, 176px"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
      </div>
      <p className="text-sm text-zinc-300 truncate font-medium">{title}</p>
      <RatingBadge rating={item.vote_average} className="mt-1" />
    </Link>
  )
}
