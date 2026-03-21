'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Trash2 } from 'lucide-react'
import Image from 'next/image'
import { useWatchlist } from '@/context/WatchlistContext'
import { posterURL } from '@/lib/constants'
import { RatingBadge } from '@/components/RatingBadge'

export default function WatchlistPage() {
  const { watchlist, removeFromWatchlist } = useWatchlist()
  const [tab, setTab] = useState<'all' | 'movie' | 'tv'>('all')

  const filtered = tab === 'all' ? watchlist : watchlist.filter((i) => i.type === tab)

  return (
    <div className="pt-20 px-6 md:px-12 min-h-screen">
      <h1 className="text-2xl font-bold text-white mb-2">My Watchlist</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {(['all', 'movie', 'tv'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              tab === t ? 'bg-red-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            {t === 'all' ? `All (${watchlist.length})` : t === 'movie' ? 'Movies' : 'TV Shows'}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-zinc-400 text-lg mb-4">Your watchlist is empty.</p>
          <div className="flex gap-3 justify-center">
            <Link href="/browse/movies" className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-md transition-colors font-medium">
              Browse Movies
            </Link>
            <Link href="/browse/tv" className="bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-2.5 rounded-md transition-colors font-medium">
              Browse TV Shows
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-4">
          {filtered.map((item) => (
            <div key={`${item.type}-${item.id}`} className="relative group">
              <Link href={`/${item.type}/${item.id}`} className="block">
                <div className="relative aspect-[2/3] bg-zinc-800 rounded-lg overflow-hidden mb-2">
                  <Image
                    src={posterURL(item.poster_path)}
                    alt={item.title}
                    fill
                    loading="lazy"
                    className="object-cover group-hover:scale-105 transition-transform duration-200"
                    sizes="(max-width: 768px) 144px, 176px"
                  />
                </div>
                <p className="text-sm text-zinc-300 truncate">{item.title}</p>
                <RatingBadge rating={item.vote_average} className="mt-1" />
              </Link>
              <button
                onClick={() => removeFromWatchlist(item.id)}
                className="absolute top-2 right-2 bg-black/60 hover:bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200"
                aria-label={`Remove ${item.title} from watchlist`}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
