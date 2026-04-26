import BrowseClient from '../movies/BrowseClient'

export const metadata = { title: 'Browse TV Shows — CineStream' }

export default function BrowseTVPage() {
  return <BrowseClient mediaType="tv" title="Browse TV Shows" />
}
