import { render, screen } from '@testing-library/react'
import { MediaCard } from '@/components/MediaCard'
import type { Movie } from '@/lib/types'

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: { alt: string; src: string }) => <img alt={props.alt} src={props.src} />,
}))

const mockMovie: Movie = {
  id: 1, title: 'Test Movie', overview: 'A great movie.',
  poster_path: '/poster.jpg', backdrop_path: null,
  vote_average: 8.0, genre_ids: [28], media_type: 'movie',
}

describe('MediaCard', () => {
  it('renders movie title', () => {
    render(<MediaCard item={mockMovie} />)
    // Title appears twice: once in hover overlay, once below card
    expect(screen.getAllByText('Test Movie').length).toBeGreaterThanOrEqual(1)
  })

  it('links to correct movie detail page', () => {
    render(<MediaCard item={mockMovie} />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/movie/1')
  })

  it('renders rating badge', () => {
    render(<MediaCard item={mockMovie} />)
    // Rating badge appears twice: once in hover overlay, once below card
    expect(screen.getAllByText('8.0').length).toBeGreaterThanOrEqual(1)
  })
})
