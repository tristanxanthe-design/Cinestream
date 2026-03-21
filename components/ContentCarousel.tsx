'use client'
import { useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { MediaItem } from '@/lib/types'
import { MediaCard } from './MediaCard'
import { SkeletonCard } from './SkeletonCard'

interface ContentCarouselProps {
  title: string
  items: MediaItem[]
  loading?: boolean
}

export function ContentCarousel({ title, items, loading = false }: ContentCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  function scroll(dir: 'left' | 'right') {
    if (!scrollRef.current) return
    const amount = scrollRef.current.clientWidth * 0.75
    scrollRef.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' })
  }

  return (
    <section className="mb-8">
      <h2 className="text-lg font-bold text-white mb-3 px-6">{title}</h2>
      <div className="relative group/carousel">
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-0 bottom-0 z-10 w-12 bg-gradient-to-r from-black/70 to-transparent flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity"
          aria-label="Scroll left"
        >
          <ChevronLeft className="text-white" size={28} />
        </button>

        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto no-scrollbar px-6 scroll-smooth"
        >
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
            : items.map((item) => <MediaCard key={item.id} item={item} />)
          }
        </div>

        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-0 bottom-0 z-10 w-12 bg-gradient-to-l from-black/70 to-transparent flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity"
          aria-label="Scroll right"
        >
          <ChevronRight className="text-white" size={28} />
        </button>
      </div>
    </section>
  )
}
