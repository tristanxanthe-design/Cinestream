'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useWatchlist } from '@/context/WatchlistContext'
import { posterURL } from '@/lib/constants'

export function ContinueWatchingRow() {
  const { history } = useWatchlist()

  if (history.length === 0) return null

  return (
    <section className="mb-6">
      <h2 className="text-lg font-semibold text-white mb-3 px-6">Continue Watching</h2>
      <div className="flex gap-3 overflow-x-auto scrollbar-hide px-6">
        {history.map((item) => {
          const href =
            item.type === 'movie'
              ? `/watch/movie/${item.id}`
              : `/watch/tv/${item.id}?s=${item.season ?? 1}&e=${item.episode ?? 1}`

          return (
            <Link
              key={`${item.type}-${item.id}`}
              href={href}
              className="flex-none w-36 md:w-44 group/card transition-transform duration-200 hover:scale-105"
            >
              <div className="relative w-full aspect-[2/3] rounded-lg overflow-hidden bg-zinc-800">
                <Image
                  src={posterURL(item.poster_path)}
                  alt={item.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 144px, 176px"
                />
              </div>
              <div className="mt-1.5 px-0.5">
                <p className="text-sm font-medium text-white truncate">{item.title}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-xs bg-zinc-600 text-zinc-200 rounded px-1.5 py-0.5 leading-none">
                    {item.type === 'movie' ? 'Movie' : 'TV'}
                  </span>
                  {item.type === 'tv' && (
                    <span className="text-xs text-zinc-400">
                      S{item.season ?? 1} E{item.episode ?? 1}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
