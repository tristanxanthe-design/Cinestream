import { render, screen } from '@testing-library/react'
import { Player } from '@/components/Player'

describe('Player', () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv, NEXT_PUBLIC_EMBED_BASE_URL: 'https://example.com' }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('renders movie iframe with correct src', () => {
    render(<Player type="movie" id={123} />)
    const iframe = screen.getByTitle('Video Player')
    expect(iframe).toHaveAttribute('src', 'https://example.com/movie/123')
  })

  it('renders TV iframe with season and episode', () => {
    render(<Player type="tv" id={456} season={2} episode={3} />)
    const iframe = screen.getByTitle('Video Player')
    expect(iframe).toHaveAttribute('src', 'https://example.com/tv/456/2/3')
  })

  it('shows config message when EMBED_BASE_URL is not set', () => {
    process.env.NEXT_PUBLIC_EMBED_BASE_URL = ''
    render(<Player type="movie" id={1} />)
    expect(screen.getByText(/embed URL not configured/i)).toBeInTheDocument()
  })
})
