'use client'
import { useState, useEffect } from 'react'

export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(key)
    if (stored) {
      try { setValue(JSON.parse(stored)) } catch {}
    }
    setHydrated(true)
  }, [key])

  useEffect(() => {
    if (hydrated) localStorage.setItem(key, JSON.stringify(value))
  }, [key, value, hydrated])

  return [value, setValue, hydrated] as const
}
