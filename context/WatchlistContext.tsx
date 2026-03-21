'use client'
import { createContext, useContext } from 'react'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import type { WatchlistItem, HistoryItem } from '@/lib/types'

interface WatchlistContextType {
  watchlist: WatchlistItem[]
  history: HistoryItem[]
  addToWatchlist: (item: WatchlistItem) => void
  removeFromWatchlist: (id: number) => void
  isInWatchlist: (id: number) => boolean
  addToHistory: (item: HistoryItem) => void
  clearHistory: () => void
}

const WatchlistContext = createContext<WatchlistContextType | null>(null)

export function WatchlistProvider({ children }: { children: React.ReactNode }) {
  const [watchlist, setWatchlist] = useLocalStorage<WatchlistItem[]>('cinestream_watchlist', [])
  const [history, setHistory] = useLocalStorage<HistoryItem[]>('cinestream_history', [])

  function addToWatchlist(item: WatchlistItem) {
    setWatchlist((prev) => {
      if (prev.some((i) => i.id === item.id && i.type === item.type)) return prev
      return [item, ...prev]
    })
  }

  function removeFromWatchlist(id: number) {
    setWatchlist((prev) => prev.filter((i) => i.id !== id))
  }

  function isInWatchlist(id: number) {
    return watchlist.some((i) => i.id === id)
  }

  function addToHistory(item: HistoryItem) {
    setHistory((prev) => {
      const filtered = prev.filter((i) => !(i.id === item.id && i.type === item.type))
      return [item, ...filtered].slice(0, 50)
    })
  }

  function clearHistory() {
    setHistory([])
  }

  return (
    <WatchlistContext.Provider value={{
      watchlist, history,
      addToWatchlist, removeFromWatchlist, isInWatchlist,
      addToHistory, clearHistory,
    }}>
      {children}
    </WatchlistContext.Provider>
  )
}

export function useWatchlist() {
  const ctx = useContext(WatchlistContext)
  if (!ctx) throw new Error('useWatchlist must be used inside WatchlistProvider')
  return ctx
}
