'use client'

import { useState, useEffect } from 'react'
import { PROVIDERS, buildEmbedUrl } from '@/lib/providers'
import { useLocalStorage } from '@/hooks/useLocalStorage'

interface PlayerProps {
  type: 'movie' | 'tv'
  id: number
  season?: number
  episode?: number
}

export function Player({ type, id, season, episode }: PlayerProps) {
  const [failed, setFailed] = useState(false)
  const [selectedIndex, setSelectedIndex] = useLocalStorage<number>('cinestream_provider', 0)
  const [statuses, setStatuses] = useState<Array<'checking' | 'ok' | 'error'>>(() => PROVIDERS.map(() => 'checking'))

  useEffect(() => {
    PROVIDERS.forEach((p, i) => {
      fetch(p.baseUrl, { mode: 'no-cors', signal: AbortSignal.timeout(5000) })
        .then(() => setStatuses(prev => { const next = [...prev]; next[i] = 'ok'; return next }))
        .catch(() => setStatuses(prev => { const next = [...prev]; next[i] = 'error'; return next }))
    })
  }, [])

  const FALLBACK_BASE = "https://www.vidking.net"
  const baseUrl = process.env.NEXT_PUBLIC_EMBED_BASE_URL || FALLBACK_BASE

  const provider = PROVIDERS[selectedIndex] ?? PROVIDERS[0]

  let src: string
  if (selectedIndex === 0) {
    // Vidking — build explicitly so the path is always appended
    src = type === 'movie'
      ? `${baseUrl}/embed/movie/${id}`
      : `${baseUrl}/embed/tv/${id}/${season ?? 1}/${episode ?? 1}`
  } else {
    src = buildEmbedUrl(provider, type, id, season, episode)
  }

  console.log('[Player] src:', src)

  const pills = (
    <div className="flex flex-wrap gap-2 mb-3">
      {PROVIDERS.map((p, i) => {
        const status = statuses[i]
        const dot = status === 'checking'
          ? <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
          : status === 'ok'
          ? <span className="w-2 h-2 rounded-full bg-green-500" />
          : <span className="w-2 h-2 rounded-full bg-red-500" />
        return (
          <button
            key={p.name}
            onClick={() => { setSelectedIndex(i); setFailed(false) }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              i === selectedIndex ? 'bg-red-600 text-white' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
            }`}
          >
            {dot}
            {p.name}
          </button>
        )
      })}
    </div>
  )

  if (failed) {
    return (
      <div>
        {pills}
        <div className="w-full aspect-video bg-zinc-900 flex items-center justify-center rounded-lg">
          <p className="text-zinc-400 text-sm text-center px-4">
            This title is not available on the current server. Try a different source.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {pills}
      <iframe
        key={src}
        src={src}
        title="Video Player"
        className="w-full aspect-video rounded-lg"
        sandbox="allow-same-origin allow-scripts allow-forms"
        referrerPolicy="origin"
        allowFullScreen={true}
        onError={() => setFailed(true)}
      />
    </div>
  )
}
