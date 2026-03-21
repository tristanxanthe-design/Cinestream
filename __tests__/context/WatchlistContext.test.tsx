import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { WatchlistProvider, useWatchlist } from '@/context/WatchlistContext'
import type { WatchlistItem } from '@/lib/types'

const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value },
    clear: () => { store = {} },
  }
})()
Object.defineProperty(window, 'localStorage', { value: localStorageMock, configurable: true, writable: true })
beforeEach(() => localStorageMock.clear())

const testItem: WatchlistItem = {
  id: 1, type: 'movie', title: 'Test Movie',
  poster_path: null, vote_average: 7.5, addedAt: new Date().toISOString(),
}

function TestComponent() {
  const { watchlist, addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist()
  return (
    <div>
      <span data-testid="count">{watchlist.length}</span>
      <span data-testid="inList">{isInWatchlist(1) ? 'yes' : 'no'}</span>
      <button onClick={() => addToWatchlist(testItem)}>Add</button>
      <button onClick={() => removeFromWatchlist(1)}>Remove</button>
    </div>
  )
}

describe('WatchlistContext', () => {
  it('starts with empty watchlist', async () => {
    render(<WatchlistProvider><TestComponent /></WatchlistProvider>)
    await act(async () => {})
    expect(screen.getByTestId('count').textContent).toBe('0')
  })

  it('adds item to watchlist', async () => {
    const user = userEvent.setup()
    render(<WatchlistProvider><TestComponent /></WatchlistProvider>)
    await act(async () => {})
    await user.click(screen.getByText('Add'))
    expect(screen.getByTestId('count').textContent).toBe('1')
    expect(screen.getByTestId('inList').textContent).toBe('yes')
  })

  it('removes item from watchlist', async () => {
    const user = userEvent.setup()
    render(<WatchlistProvider><TestComponent /></WatchlistProvider>)
    await act(async () => {})
    await user.click(screen.getByText('Add'))
    await user.click(screen.getByText('Remove'))
    expect(screen.getByTestId('count').textContent).toBe('0')
    expect(screen.getByTestId('inList').textContent).toBe('no')
  })
})
