'use client'
import { useState } from 'react'
import { X, Copy, Check, Users, ExternalLink } from 'lucide-react'

interface Props {
  onClose: () => void
}

export function WatchPartyModal({ onClose }: Props) {
  const [ngrokUrl, setNgrokUrl] = useState<string | null>(null)
  const [launching, setLaunching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  async function handleLaunch() {
    setLaunching(true)
    setError(null)
    try {
      const res = await fetch('/api/ngrok', { method: 'POST' })
      const data = await res.json()
      if (data.url) {
        setNgrokUrl(data.url)
      } else {
        setError(data.error || 'Failed to launch ngrok')
      }
    } catch {
      setError('Failed to connect to ngrok API')
    } finally {
      setLaunching(false)
    }
  }

  async function handleCopy() {
    if (!ngrokUrl) return
    await navigator.clipboard.writeText(ngrokUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-zinc-900 border border-zinc-700 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors">
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <Users size={24} className="text-red-500" />
          <h2 className="text-xl font-bold text-white">Watch Party</h2>
        </div>

        <p className="text-zinc-400 text-sm mb-6">
          Share CineStream with friends using ngrok to expose your local server to the internet.
        </p>

        {/* Manual instructions */}
        <div className="space-y-3 mb-6">
          <div className="flex items-start gap-3">
            <span className="shrink-0 w-6 h-6 bg-red-600 rounded-full text-white text-xs flex items-center justify-center font-bold">1</span>
            <div>
              <p className="text-white text-sm font-medium">Install ngrok</p>
              <a href="https://ngrok.com/download" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 text-xs flex items-center gap-1 mt-0.5">
                ngrok.com/download <ExternalLink size={10} />
              </a>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="shrink-0 w-6 h-6 bg-red-600 rounded-full text-white text-xs flex items-center justify-center font-bold">2</span>
            <div>
              <p className="text-white text-sm font-medium">Run in terminal</p>
              <code className="text-zinc-300 text-xs bg-zinc-800 px-2 py-1 rounded mt-1 block">ngrok http 3000</code>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="shrink-0 w-6 h-6 bg-red-600 rounded-full text-white text-xs flex items-center justify-center font-bold">3</span>
            <div>
              <p className="text-white text-sm font-medium">Share the generated URL</p>
              <p className="text-zinc-400 text-xs mt-0.5">Your friends can open it in any browser</p>
            </div>
          </div>
        </div>

        {/* Auto-launch section */}
        <div className="border-t border-zinc-700 pt-4">
          <p className="text-zinc-400 text-xs mb-3">Or auto-launch ngrok (must be installed):</p>

          {ngrokUrl ? (
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={ngrokUrl}
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-md px-3 py-1.5 text-white text-xs outline-none"
              />
              <button
                onClick={handleCopy}
                className="shrink-0 flex items-center gap-1 bg-zinc-700 hover:bg-zinc-600 text-white px-3 py-1.5 rounded-md text-xs transition-colors"
              >
                {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          ) : (
            <button
              onClick={handleLaunch}
              disabled={launching}
              className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold py-2 rounded-md text-sm transition-colors"
            >
              {launching ? 'Launching ngrok...' : 'Launch ngrok'}
            </button>
          )}

          {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
        </div>
      </div>
    </div>
  )
}
