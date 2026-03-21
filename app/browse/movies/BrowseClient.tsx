'use client'
import { useState, useEffect, useCallback } from 'react'
import { getPopular, discoverByGenre } from '@/lib/tmdb'
import { GenreFilter } from '@/components/GenreFilter'
import { MediaCard } from '@/components/MediaCard'
import { SkeletonCard } from '@/components/SkeletonCard'
import type { Genre, MediaItem } from '@/lib/types'

interface BrowseClientProps {
  mediaType: 'movie' | 'tv'
  genres: Genre[]
}

export function BrowseClient({ mediaType, genres }: BrowseClientProps) {
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null)
  const [items, setItems] = useState<MediaItem[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)

  const fetchItems = useCallback(async (genreId: number | null, p: number) => {
    setLoading(true)
    try {
      const data = genreId
        ? await discoverByGenre(mediaType, genreId, p)
        : await getPopular(mediaType, p)
      const tagged = data.results.map((i: any) => ({ ...i, media_type: mediaType })) as MediaItem[]
      setItems((prev) => p === 1 ? tagged : [...prev, ...tagged])
      setTotalPages(data.total_pages)
    } catch {}
    setLoading(false)
  }, [mediaType])

  useEffect(() => {
    setPage(1)
    setItems([])
    fetchItems(selectedGenre, 1)
  }, [selectedGenre, fetchItems])

  function loadMore() {
    const next = page + 1
    setPage(next)
    fetchItems(selectedGenre, next)
  }

  return (
    <div className="pt-20 px-6 md:px-12 min-h-screen">
      <h1 className="text-2xl font-bold text-white mb-4">
        Browse {mediaType === 'movie' ? 'Movies' : 'TV Shows'}
      </h1>
      <div className="mb-6">
        <GenreFilter genres={genres} selected={selectedGenre} onSelect={setSelectedGenre} />
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-4 mb-8">
        {items.map((item) => <MediaCard key={`${item.media_type}-${item.id}`} item={item} />)}
        {loading && Array.from({ length: 7 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
      {!loading && page < totalPages && (
        <div className="text-center pb-12">
          <button
            onClick={loadMore}
            className="bg-zinc-800 hover:bg-zinc-700 text-white px-8 py-2.5 rounded-md transition-colors font-medium"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  )
}
