import { getGenres } from '@/lib/tmdb'
import { BrowseClient } from '../movies/BrowseClient'

export const metadata = { title: 'Browse TV Shows — CineStream' }

export default async function BrowseTVPage() {
  const genreData = await getGenres('tv').catch(() => ({ genres: [] }))
  return <BrowseClient mediaType="tv" genres={genreData.genres} />
}
