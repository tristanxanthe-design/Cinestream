'use client'
import { useRef } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { MediaItem } from '@/lib/types'
import { MediaCard } from './MediaCard'
import { SkeletonCard } from './SkeletonCard'

interface ContentCarouselProps {
  title: string
  items: MediaItem[]
  loading?: boolean
}

const containerVariants = {
  animate: {
    transition: {
      staggerChildren: 0.05,
    },
  },
}

const itemVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
}

export function ContentCarousel({ title, items, loading = false }: ContentCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  function scroll(dir: 'left' | 'right') {
    if (!scrollRef.current) return
    const amount = scrollRef.current.clientWidth * 0.75
    scrollRef.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' })
  }

  return (
    <section className="mb-6">
      <h2 className="text-lg font-semibold text-white mb-3 px-6">{title}</h2>
      <div className="relative group/carousel">
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-0 bottom-0 z-10 w-12 bg-gradient-to-r from-black/70 to-transparent flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity"
          aria-label="Scroll left"
        >
          <ChevronLeft className="text-white" size={28} />
        </button>

        <motion.div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto scrollbar-hide px-6"
          key={items.length}
          variants={containerVariants}
          initial="initial"
          animate="animate"
        >
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
            : items.map((item) => (
                <motion.div key={item.id} variants={itemVariants}>
                  <MediaCard item={item} />
                </motion.div>
              ))
          }
        </motion.div>

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
