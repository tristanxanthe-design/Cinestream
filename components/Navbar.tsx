'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Search, Bookmark, Film, Shuffle, Loader2, Users } from 'lucide-react'
import { useWatchlist } from '@/context/WatchlistContext'
import { getTrending } from '@/lib/tmdb'
import { WatchPartyModal } from './WatchPartyModal'

export function Navbar() {
  const router = useRouter()
  const { watchlist } = useWatchlist()
  const [query, setQuery] = useState('')
  const [scrolled, setScrolled] = useState(false)
  const [randomLoading, setRandomLoading] = useState(false)
  const [showWatchParty, setShowWatchParty] = useState(false)

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      if (e.key === '/') {
        e.preventDefault()
        document.getElementById('search-input')?.focus()
      }
      if (e.key === 'Escape') {
        router.back()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [router])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (query.trim()) router.push(`/search?q=${encodeURIComponent(query.trim())}`)
  }

  async function handleRandomPick() {
    setRandomLoading(true)
    try {
      const data = await getTrending('movie', 'day')
      const filtered = data.results.filter((m: any) => m.vote_average >= 7.0)
      const pool = filtered.length > 0 ? filtered : data.results
      const pick = pool[Math.floor(Math.random() * pool.length)]
      router.push(`/movie/${pick.id}`)
    } finally {
      setRandomLoading(false)
    }
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 h-16 flex items-center px-6 gap-6 transition-colors duration-300 ${
        scrolled
          ? 'bg-black/80 backdrop-blur-md'
          : 'bg-transparent'
      }`}
    >
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
        <Link href="/collections" className="text-zinc-300 hover:text-white transition-colors">
          Collections
        </Link>
        <Link href="/upcoming" className="text-zinc-300 hover:text-white transition-colors">
          Upcoming
        </Link>
        <Link href="/requests" className="text-zinc-300 hover:text-white transition-colors">
          Requests
        </Link>
        <Link href="/lists" className="text-zinc-300 hover:text-white transition-colors">
          Lists
        </Link>
      </div>

      <button
        onClick={handleRandomPick}
        disabled={randomLoading}
        aria-label="Random pick"
        className="flex items-center gap-1.5 text-zinc-300 hover:text-white transition-colors disabled:opacity-50"
      >
        {randomLoading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            <span className="text-xs hidden sm:inline">Finding...</span>
          </>
        ) : (
          <Shuffle size={18} />
        )}
      </button>

      <div className="flex-1" />

      <form onSubmit={handleSearch} className="flex items-center">
        <div className="flex items-center bg-zinc-900/80 border border-zinc-700 rounded-md px-3 py-1.5 gap-2 focus-within:border-zinc-500 transition-colors">
          <Search size={16} className="text-zinc-400 shrink-0" />
          <input
            id="search-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search movies & TV..."
            className="bg-transparent text-sm text-white placeholder-zinc-500 outline-none w-48"
          />
        </div>
      </form>

      <button
        onClick={() => setShowWatchParty(true)}
        aria-label="Watch Party"
        className="flex items-center gap-1.5 text-zinc-300 hover:text-white transition-colors"
      >
        <Users size={18} />
        <span className="text-sm hidden sm:inline">Share</span>
      </button>

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

      {showWatchParty && <WatchPartyModal onClose={() => setShowWatchParty(false)} />}
    </nav>
  )
}
