'use client'
import { createContext, useContext } from 'react'
import { useLocalStorage } from '@/hooks/useLocalStorage'

type ProgressStore = Record<string, Record<string, true>>

interface ProgressContextType {
  markWatched: (tvId: number, season: number, episode: number) => void
  isWatched: (tvId: number, season: number, episode: number) => boolean
  getWatchedCount: (tvId: number, season: number) => number
  getSeasonProgress: (tvId: number, season: number, totalEpisodes: number) => number
}

const ProgressContext = createContext<ProgressContextType | null>(null)

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [progress, setProgress] = useLocalStorage<ProgressStore>('cinestream_progress', {})

  function key(season: number, episode: number) {
    return `S${season}E${episode}`
  }

  function markWatched(tvId: number, season: number, episode: number) {
    setProgress(prev => ({
      ...prev,
      [tvId]: { ...(prev[tvId] ?? {}), [key(season, episode)]: true }
    }))
  }

  function isWatched(tvId: number, season: number, episode: number) {
    return !!(progress[tvId]?.[key(season, episode)])
  }

  function getWatchedCount(tvId: number, season: number) {
    const showProgress = progress[tvId] ?? {}
    return Object.keys(showProgress).filter(k => k.startsWith(`S${season}E`)).length
  }

  function getSeasonProgress(tvId: number, season: number, totalEpisodes: number) {
    if (totalEpisodes === 0) return 0
    return Math.round((getWatchedCount(tvId, season) / totalEpisodes) * 100)
  }

  return (
    <ProgressContext.Provider value={{ markWatched, isWatched, getWatchedCount, getSeasonProgress }}>
      {children}
    </ProgressContext.Provider>
  )
}

export function useProgress() {
  const ctx = useContext(ProgressContext)
  if (!ctx) throw new Error('useProgress must be used inside ProgressProvider')
  return ctx
}
