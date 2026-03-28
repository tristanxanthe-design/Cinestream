'use client'

import { useEffect, useState } from 'react'
import { useWatchlist } from '@/context/WatchlistContext'
import { getSimilar } from '@/lib/tmdb'
import { ContentCarousel } from '@/components/ContentCarousel'
import type { MediaItem } from '@/lib/types'

export function BecauseYouWatchedRow() {
  const { history } = useWatchlist()
  const [items, setItems] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (history.length === 0) return

    const source = history[0]
    setLoading(true)
    setItems([])

    getSimilar(source.type, source.id)
      .then((res) => {
        const mapped: MediaItem[] = res.results.map((i: any) => ({
          ...i,
          media_type: source.type as 'movie' | 'tv',
        }))
        setItems(mapped)
      })
      .catch(() => {
        setItems([])
      })
      .finally(() => {
        setLoading(false)
      })
  }, [history])

  if (history.length === 0) return null
  if (!loading && items.length === 0) return null

  return (
    <ContentCarousel
      title={`Because you watched ${history[0].title}`}
      items={items}
      loading={loading}
    />
  )
}
