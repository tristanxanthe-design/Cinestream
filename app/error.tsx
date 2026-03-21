'use client'
import { useEffect } from 'react'

interface Props { error: Error; reset: () => void }

export default function ErrorPage({ error, reset }: Props) {
  useEffect(() => { console.error(error) }, [error])
  return (
    <div className="pt-16 min-h-screen flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-4xl font-bold text-white mb-3">Something went wrong</h1>
      <p className="text-zinc-400 mb-8">{error.message || 'An unexpected error occurred.'}</p>
      <button
        onClick={reset}
        className="bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-3 rounded-md transition-colors"
      >
        Try Again
      </button>
    </div>
  )
}
