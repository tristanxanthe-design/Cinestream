import { getTrending, getPopular, getTopRated, getNowPlaying, getOnTheAir } from '@/lib/tmdb'
import { HeroBanner } from '@/components/HeroBanner'
import { ContentCarousel } from '@/components/ContentCarousel'
import type { MediaItem } from '@/lib/types'

export default async function HomePage() {
  const [
    trending,
    popularMovies,
    popularTV,
    topRated,
    nowPlaying,
    onTheAir,
  ] = await Promise.all([
    getTrending('movie', 'day'),
    getPopular('movie'),
    getPopular('tv'),
    getTopRated('movie'),
    getNowPlaying(),
    getOnTheAir(),
  ])

  // Pick 5-8 trending items for hero rotation
  const heroItems = trending.results.slice(0, 8) as MediaItem[]

  return (
    <div className="pt-16">
      <HeroBanner items={heroItems} />
      <div className="py-8">
        <ContentCarousel title="Trending Today" items={trending.results as MediaItem[]} />
        <ContentCarousel title="Popular Movies" items={popularMovies.results as MediaItem[]} />
        <ContentCarousel title="Popular TV Shows" items={popularTV.results as MediaItem[]} />
        <ContentCarousel title="Top Rated Movies" items={topRated.results as MediaItem[]} />
        <ContentCarousel title="Now Playing" items={nowPlaying.results as MediaItem[]} />
        <ContentCarousel title="On The Air" items={onTheAir.results as MediaItem[]} />
      </div>
    </div>
  )
}
