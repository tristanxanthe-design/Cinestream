import { render, screen } from '@testing-library/react'
import { ContentCarousel } from '@/components/ContentCarousel'
import type { Movie } from '@/lib/types'

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: { alt: string }) => <img alt={props.alt} />,
}))

const mockItems: Movie[] = [
  { id: 1, title: 'Movie 1', overview: '', poster_path: null, backdrop_path: null, vote_average: 7, genre_ids: [], media_type: 'movie' },
  { id: 2, title: 'Movie 2', overview: '', poster_path: null, backdrop_path: null, vote_average: 8, genre_ids: [], media_type: 'movie' },
]

describe('ContentCarousel', () => {
  it('renders the title', () => {
    render(<ContentCarousel title="Trending" items={mockItems} />)
    expect(screen.getByText('Trending')).toBeInTheDocument()
  })

  it('renders all items', () => {
    render(<ContentCarousel title="Trending" items={mockItems} />)
    expect(screen.getByText('Movie 1')).toBeInTheDocument()
    expect(screen.getByText('Movie 2')).toBeInTheDocument()
  })

  it('renders skeleton cards when loading', () => {
    render(<ContentCarousel title="Trending" items={[]} loading />)
    expect(document.querySelectorAll('.animate-pulse')).toHaveLength(6)
  })
})
