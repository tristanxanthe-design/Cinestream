'use client'

import { useState, useEffect } from 'react'
import { getTrending, getPopular, getTopRated, getNowPlaying, getOnTheAir, getTrendingPeople } from '@/lib/tmdb'
import { HeroBanner } from '@/components/HeroBanner'
import { ContentCarousel } from '@/components/ContentCarousel'
import { ContinueWatchingRow } from '@/components/ContinueWatchingRow'
import { BecauseYouWatchedRow } from '@/components/BecauseYouWatchedRow'
import { PeopleCarousel } from '@/components/PeopleCarousel'
import type { MediaItem } from '@/lib/types'
import type { Person } from '@/lib/tmdb'

export default function HomePage() {
  const [heroItems, setHeroItems] = useState<MediaItem[]>([])
  const [trending, setTrending] = useState<MediaItem[]>([])
  const [popularMovies, setPopularMovies] = useState<MediaItem[]>([])
  const [popularTV, setPopularTV] = useState<MediaItem[]>([])
  const [topRated, setTopRated] = useState<MediaItem[]>([])
  const [nowPlaying, setNowPlaying] = useState<MediaItem[]>([])
  const [onTheAir, setOnTheAir] = useState<MediaItem[]>([])
  const [people, setPeople] = useState<Person[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAll() {
      try {
        const [
          trendingRes,
          popularMoviesRes,
          popularTVRes,
          topRatedRes,
          nowPlayingRes,
          onTheAirRes,
          peopleRes,
        ] = await Promise.all([
          getTrending('movie', 'day'),
          getPopular('movie'),
          getPopular('tv'),
          getTopRated('movie'),
          getNowPlaying(),
          getOnTheAir(),
          getTrendingPeople(),
        ])

        const trendingItems: MediaItem[] = trendingRes.results.map((i: any) => ({ ...i, media_type: 'movie' as const }))
        setHeroItems(trendingItems.slice(0, 8))
        setTrending(trendingItems)
        setPopularMovies(popularMoviesRes.results.map((i: any) => ({ ...i, media_type: 'movie' as const })))
        setPopularTV(popularTVRes.results.map((i: any) => ({ ...i, media_type: 'tv' as const })))
        setTopRated(topRatedRes.results.map((i: any) => ({ ...i, media_type: 'movie' as const })))
        setNowPlaying(nowPlayingRes.results.map((i: any) => ({ ...i, media_type: 'movie' as const })))
        setOnTheAir(onTheAirRes.results.map((i: any) => ({ ...i, media_type: 'tv' as const })))
        setPeople(peopleRes.results)
      } finally {
        setLoading(false)
      }
    }

    fetchAll()
  }, [])

  return (
    <div className="pt-16">
      <HeroBanner items={heroItems} />
      <div className="py-8">
        <ContinueWatchingRow />
        <ContentCarousel title="Trending Today" items={trending} loading={loading} />
        <BecauseYouWatchedRow />
        <ContentCarousel title="Popular Movies" items={popularMovies} loading={loading} />
        <ContentCarousel title="Popular TV Shows" items={popularTV} loading={loading} />
        <ContentCarousel title="Top Rated Movies" items={topRated} loading={loading} />
        <ContentCarousel title="Now Playing" items={nowPlaying} loading={loading} />
        <ContentCarousel title="On The Air" items={onTheAir} loading={loading} />
        <PeopleCarousel people={people} />
      </div>
    </div>
  )
}
