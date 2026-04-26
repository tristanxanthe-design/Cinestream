import { getGenres } from '@/lib/tmdb'
import { BrowseClient } from './BrowseClient'

export const metadata = { title: 'Browse Movies — CineStream' }

export default async function BrowseMoviesPage() {
  const genreData = await getGenres('movie').catch(() => ({ genres: [] }))
  return <BrowseClient mediaType="movie" genres={genreData.genres} />
}
