import { render, screen } from '@testing-library/react'
import { Navbar } from '@/components/Navbar'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => '/',
}))

// Mock WatchlistContext
jest.mock('@/context/WatchlistContext', () => ({
  useWatchlist: () => ({ watchlist: [] }),
}))

describe('Navbar', () => {
  it('renders logo text', () => {
    render(<Navbar />)
    expect(screen.getByText('CineStream')).toBeInTheDocument()
  })

  it('renders navigation links', () => {
    render(<Navbar />)
    expect(screen.getByText('Movies')).toBeInTheDocument()
    expect(screen.getByText('TV Shows')).toBeInTheDocument()
  })

  it('renders watchlist link', () => {
    render(<Navbar />)
    expect(screen.getByRole('link', { name: /watchlist/i })).toBeInTheDocument()
  })
})
