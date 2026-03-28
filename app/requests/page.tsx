'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Trash2, Search } from 'lucide-react'
import { searchMulti } from '@/lib/tmdb'

interface RequestItem {
  id: string
  title: string
  type: 'movie' | 'tv'
  notes: string
  addedAt: string
  tmdbResult?: { id: number; type: 'movie' | 'tv'; title: string } | null
}

export default function RequestsPage() {
  const [requests, setRequests] = useState<RequestItem[]>([])
  const [hydrated, setHydrated] = useState(false)
  const [titleInput, setTitleInput] = useState('')
  const [typeInput, setTypeInput] = useState<'movie' | 'tv'>('movie')
  const [notesInput, setNotesInput] = useState('')
  const [checking, setChecking] = useState<string | null>(null) // request id being checked

  useEffect(() => {
    const stored = localStorage.getItem('cinestream_requests')
    if (stored) {
      try { setRequests(JSON.parse(stored)) } catch {}
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (hydrated) localStorage.setItem('cinestream_requests', JSON.stringify(requests))
  }, [requests, hydrated])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!titleInput.trim()) return
    const newItem: RequestItem = {
      id: crypto.randomUUID(),
      title: titleInput.trim(),
      type: typeInput,
      notes: notesInput.trim(),
      addedAt: new Date().toISOString(),
    }
    setRequests(prev => [newItem, ...prev])
    setTitleInput('')
    setNotesInput('')
  }

  function handleDelete(id: string) {
    setRequests(prev => prev.filter(r => r.id !== id))
  }

  async function handleCheckAvailability(requestId: string, title: string) {
    setChecking(requestId)
    try {
      const data = await searchMulti(title)
      const result = data.results.find((r: any) => r.media_type === 'movie' || r.media_type === 'tv') as any
      setRequests(prev => prev.map(r => r.id === requestId ? {
        ...r,
        tmdbResult: result ? { id: result.id, type: result.media_type, title: result.title || result.name } : null
      } : r))
    } catch {
      setRequests(prev => prev.map(r => r.id === requestId ? { ...r, tmdbResult: null } : r))
    } finally {
      setChecking(null)
    }
  }

  return (
    <div className="pt-20 min-h-screen px-6 md:px-12 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-8">Content Requests</h1>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-zinc-900 rounded-lg p-6 mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">Request a Title</h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-zinc-400 block mb-1">Title</label>
            <input
              value={titleInput}
              onChange={e => setTitleInput(e.target.value)}
              placeholder="Movie or show title..."
              className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-white text-sm outline-none focus:border-zinc-500"
              required
            />
          </div>
          <div>
            <label className="text-sm text-zinc-400 block mb-1">Type</label>
            <select
              value={typeInput}
              onChange={e => setTypeInput(e.target.value as 'movie' | 'tv')}
              className="bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-white text-sm outline-none focus:border-zinc-500"
            >
              <option value="movie">Movie</option>
              <option value="tv">TV Show</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-zinc-400 block mb-1">Notes (optional)</label>
            <textarea
              value={notesInput}
              onChange={e => setNotesInput(e.target.value)}
              placeholder="Any additional info..."
              rows={3}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-white text-sm outline-none focus:border-zinc-500 resize-none"
            />
          </div>
          <button
            type="submit"
            className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2 rounded-md transition-colors text-sm"
          >
            Add Request
          </button>
        </div>
      </form>

      {/* List */}
      {requests.length === 0 ? (
        <p className="text-zinc-500 text-sm text-center py-12">No requests yet. Add a title above.</p>
      ) : (
        <div className="space-y-3">
          {requests.map(req => (
            <div key={req.id} className="bg-zinc-900 rounded-lg p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white font-medium">{req.title}</span>
                    <span className="text-xs bg-zinc-700 text-zinc-300 px-2 py-0.5 rounded-full">
                      {req.type === 'movie' ? 'Movie' : 'TV Show'}
                    </span>
                  </div>
                  {req.notes && <p className="text-zinc-400 text-sm mb-2">{req.notes}</p>}
                  <p className="text-zinc-600 text-xs">{new Date(req.addedAt).toLocaleDateString()}</p>

                  {/* TMDB result */}
                  {'tmdbResult' in req && (
                    <div className="mt-2">
                      {req.tmdbResult ? (
                        <Link
                          href={`/${req.tmdbResult.type}/${req.tmdbResult.id}`}
                          className="text-sm text-green-400 hover:text-green-300 underline"
                        >
                          ✓ Found: {req.tmdbResult.title} — View on CineStream
                        </Link>
                      ) : (
                        <span className="text-sm text-red-400">✗ Not found on TMDB</span>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleCheckAvailability(req.id, req.title)}
                    disabled={checking === req.id}
                    className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 px-2 py-1 rounded transition-colors disabled:opacity-50"
                  >
                    <Search size={12} />
                    {checking === req.id ? 'Checking...' : 'Check'}
                  </button>
                  <button
                    onClick={() => handleDelete(req.id)}
                    className="text-zinc-500 hover:text-red-400 transition-colors"
                    aria-label="Delete request"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
