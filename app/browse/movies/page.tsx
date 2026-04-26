import BrowseClient from './BrowseClient'

export const metadata = { title: 'Browse Movies — CineStream' }

export default function BrowseMoviesPage() {
  return <BrowseClient mediaType="movie" title="Browse Movies" />
}
