'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Search, Bookmark, Film } from 'lucide-react'
import { useWatchlist } from '@/context/WatchlistContext'
export function Navbar() {
  const router = useRouter()
  const { watchlist } = useWatchlist()
  const [query, setQuery] = useState('')

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (query.trim()) router.push(`/search?q=${encodeURIComponent(query.trim())}`)
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-gradient-to-b from-black/90 to-transparent backdrop-blur-sm flex items-center px-6 gap-6">
      <Link href="/" className="flex items-center gap-2 text-red-600 font-bold text-xl shrink-0">
        <Film size={24} />
        CineStream
      </Link>

      <div className="flex items-center gap-4 text-sm font-medium">
        <Link href="/browse/movies" className="text-zinc-300 hover:text-white transition-colors">
          Movies
        </Link>
        <Link href="/browse/tv" className="text-zinc-300 hover:text-white transition-colors">
          TV Shows
        </Link>
      </div>

      <div className="flex-1" />

      <form onSubmit={handleSearch} className="flex items-center">
        <div className="flex items-center bg-zinc-900/80 border border-zinc-700 rounded-md px-3 py-1.5 gap-2 focus-within:border-zinc-500 transition-colors">
          <Search size={16} className="text-zinc-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search movies & TV..."
            className="bg-transparent text-sm text-white placeholder-zinc-500 outline-none w-48"
          />
        </div>
      </form>

      <Link
        href="/watchlist"
        aria-label="Watchlist"
        className="relative flex items-center gap-1.5 text-zinc-300 hover:text-white transition-colors"
      >
        <Bookmark size={20} />
        <span className="text-sm">Watchlist</span>
        {watchlist.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
            {watchlist.length > 9 ? '9+' : watchlist.length}
          </span>
        )}
      </Link>
    </nav>
  )
}
