'use client'
import { useEffect } from 'react'
import { X } from 'lucide-react'

interface TrailerModalProps {
  videoKey: string
  onClose: () => void
}

export function TrailerModal({ videoKey, onClose }: TrailerModalProps) {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl aspect-video"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white hover:text-zinc-300 transition-colors"
          aria-label="Close trailer"
        >
          <X size={28} />
        </button>
        <iframe
          src={`https://www.youtube.com/embed/${videoKey}?autoplay=1`}
          title="Trailer"
          className="w-full h-full rounded-lg"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  )
}
