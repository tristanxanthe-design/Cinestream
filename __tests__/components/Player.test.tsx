import { render, screen } from '@testing-library/react'
import { Player } from '@/components/Player'

// jsdom doesn't have fetch or AbortSignal.timeout — mock both
global.fetch = jest.fn(() => Promise.resolve()) as jest.Mock
Object.defineProperty(AbortSignal, 'timeout', { value: jest.fn(() => new AbortController().signal), configurable: true })

// Player now uses PROVIDERS array (Vidking as default, index 0)
// Vidking: baseUrl=https://www.vidking.net, movie=/embed/movie/{id}, tv=/embed/tv/{id}/{s}/{e}
// params=?autoPlay=true&nextEpisode=true&episodeSelector=true&color=e50914

describe('Player', () => {
  it('renders movie iframe with correct src using default provider (Vidking)', () => {
    render(<Player type="movie" id={123} />)
    const iframe = screen.getByTitle('Video Player')
    expect(iframe).toHaveAttribute(
      'src',
      'https://www.vidking.net/embed/movie/123?autoPlay=true&nextEpisode=true&episodeSelector=true&color=e50914'
    )
  })

  it('renders TV iframe with season and episode using default provider', () => {
    render(<Player type="tv" id={456} season={2} episode={3} />)
    const iframe = screen.getByTitle('Video Player')
    expect(iframe).toHaveAttribute(
      'src',
      'https://www.vidking.net/embed/tv/456/2/3?autoPlay=true&nextEpisode=true&episodeSelector=true&color=e50914'
    )
  })

  it('renders provider pill buttons', () => {
    render(<Player type="movie" id={1} />)
    expect(screen.getByText('Vidking')).toBeInTheDocument()
    expect(screen.getByText('VidSrc')).toBeInTheDocument()
    expect(screen.getByText('VidSrc ICU')).toBeInTheDocument()
  })
})
