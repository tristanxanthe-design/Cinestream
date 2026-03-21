'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Info } from 'lucide-react'
import type { MediaItem } from '@/lib/types'
import { backdropURL } from '@/lib/constants'
import { RatingBadge } from './RatingBadge'

interface HeroBannerProps {
  items: MediaItem[]
}

export function HeroBanner({ items }: HeroBannerProps) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (items.length <= 1) return
    const timer = setInterval(() => setIndex((i) => (i + 1) % items.length), 8000)
    return () => clearInterval(timer)
  }, [items.length])

  if (!items.length) return <div className="h-[60vh] bg-zinc-900 animate-pulse" />

  const item = items[index]
  const isMovie = item.media_type === 'movie'
  const title = isMovie ? item.title : item.name
  const watchHref = `/${isMovie ? 'watch/movie' : 'watch/tv'}/${item.id}`
  const detailHref = `/${isMovie ? 'movie' : 'tv'}/${item.id}`

  return (
    <div className="relative h-[70vh] min-h-[500px] overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={item.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
        >
          <Image
            src={backdropURL(item.backdrop_path)}
            alt={title}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 flex flex-col justify-end h-full pb-16 px-6 md:px-12 max-w-2xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5 }}
          >
            <RatingBadge rating={item.vote_average} className="mb-3" />
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">{title}</h1>
            <p className="text-zinc-300 text-sm md:text-base line-clamp-3 mb-6">
              {item.overview}
            </p>
            <div className="flex gap-3">
              <Link
                href={watchHref}
                className="flex items-center gap-2 bg-white text-black font-bold px-6 py-2.5 rounded-md hover:bg-zinc-200 transition-colors"
              >
                <Play size={18} fill="black" /> Watch Now
              </Link>
              <Link
                href={detailHref}
                className="flex items-center gap-2 bg-zinc-700/80 text-white font-semibold px-6 py-2.5 rounded-md hover:bg-zinc-600 transition-colors"
              >
                <Info size={18} /> More Info
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Dot indicators */}
        <div className="flex gap-1.5 mt-6">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`h-1 rounded-full transition-all duration-300 ${i === index ? 'w-6 bg-white' : 'w-2 bg-zinc-600'}`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
