'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { PlayCircle } from 'lucide-react'
import type { MediaItem } from '@/lib/types'
import { posterURL } from '@/lib/constants'
import { RatingBadge } from './RatingBadge'
import { getVideos } from '@/lib/tmdb'

interface MediaCardProps {
  item: MediaItem
}

export function MediaCard({ item }: MediaCardProps) {
  const isMovie = item.media_type === 'movie'
  const title = isMovie ? item.title : item.name
  const href = `/${isMovie ? 'movie' : 'tv'}/${item.id}`
  const rawYear = isMovie ? item.release_date : item.first_air_date
  const year = rawYear ? new Date(rawYear).getFullYear() : null

  const [trailerKey, setTrailerKey] = useState<string | null>(null)
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  function handleMouseEnter() {
    if (typeof window !== 'undefined' && window.innerWidth <= 768) return
    hoverTimer.current = setTimeout(async () => {
      try {
        const mediaType = item.media_type === 'movie' ? 'movie' : 'tv'
        const videos = await getVideos(mediaType, item.id)
        const trailer = videos.results.find(v => v.site === 'YouTube' && v.type === 'Trailer')
        if (trailer) setTrailerKey(trailer.key)
      } catch {
        // no trailer, keep poster
      }
    }, 2000)
  }

  function handleMouseLeave() {
    if (hoverTimer.current) {
      clearTimeout(hoverTimer.current)
      hoverTimer.current = null
    }
    setTrailerKey(null)
  }

  return (
    <Link href={href} className="group shrink-0 w-36 md:w-44 block" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <div className="relative aspect-[2/3] bg-zinc-800 rounded-lg overflow-hidden mb-2 group-hover:shadow-lg group-hover:shadow-black/30 transition-shadow duration-200">
        {trailerKey ? (
          <iframe
            src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=1&controls=0&loop=1&playlist=${trailerKey}&modestbranding=1`}
            title="Trailer"
            className="absolute inset-0 w-full h-full"
            allow="autoplay"
          />
        ) : (
          <>
            <Image
              src={posterURL(item.poster_path)}
              alt={title}
              fill
              loading="lazy"
              className="object-cover group-hover:scale-105 transition-transform duration-200"
              sizes="(max-width: 768px) 144px, 176px"
            />
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-between py-3">
              {/* Centered play icon */}
              <div className="flex-1 flex items-center justify-center">
                <PlayCircle size={48} className="text-white drop-shadow-lg" />
              </div>
              {/* Bottom info */}
              <div className="w-full px-2">
                <p className="text-sm font-medium text-white truncate mb-1">{title}</p>
                <div className="flex items-center gap-2">
                  {item.vote_average > 0 && <RatingBadge rating={item.vote_average} />}
                  {year && <span className="text-xs text-zinc-400">{year}</span>}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      <p className="text-sm font-medium text-white truncate">{title}</p>
      {item.vote_average > 0 && <RatingBadge rating={item.vote_average} className="mt-1" />}
    </Link>
  )
}
