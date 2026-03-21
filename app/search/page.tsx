'use client'
import { useSearchParams } from 'next/navigation'
import { useState, useEffect, Suspense } from 'react'
import { searchMulti } from '@/lib/tmdb'
import { MediaCard } from '@/components/MediaCard'
import { SkeletonCard } from '@/components/SkeletonCard'
import type { MediaItem } from '@/lib/types'

function SearchResults() {
  const params = useSearchParams()
  const query = params.get('q') ?? ''
  const [results, setResults] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState<'all' | 'movie' | 'tv'>('all')

  useEffect(() => {
    if (!query) { setResults([]); return }
    setLoading(true)
    searchMulti(query)
      .then((data) => {
        const items = data.results.filter((r: any) => r.media_type === 'movie' || r.media_type === 'tv') as MediaItem[]
        setResults(items)
      })
      .catch(() => setResults([]))
      .finally(() => setLoading(false))
  }, [query])

  const filtered = tab === 'all' ? results : results.filter((r) => r.media_type === tab)

  return (
    <div className="pt-20 px-6 md:px-12 min-h-screen">
      <h1 className="text-2xl font-bold text-white mb-2">
        {query ? `Results for "${query}"` : 'Search'}
      </h1>

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
            {t === 'all' ? 'All' : t === 'movie' ? 'Movies' : 'TV Shows'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-4">
          {Array.from({ length: 14 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-zinc-400 text-lg">{query ? 'No results found.' : 'Type something to search.'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-4">
          {filtered.map((item) => <MediaCard key={`${item.media_type}-${item.id}`} item={item} />)}
        </div>
      )}
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="pt-20 px-6 text-zinc-400">Loading...</div>}>
      <SearchResults />
    </Suspense>
  )
}
