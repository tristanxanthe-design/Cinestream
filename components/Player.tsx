interface PlayerProps {
  type: 'movie' | 'tv'
  id: number
  season?: number
  episode?: number
}

export function Player({ type, id, season, episode }: PlayerProps) {
  const base = process.env.NEXT_PUBLIC_EMBED_BASE_URL

  if (!base) {
    return (
      <div className="w-full aspect-video bg-zinc-900 flex items-center justify-center rounded-lg">
        <p className="text-zinc-400 text-sm">
          Embed URL not configured. Set{' '}
          <code className="text-red-400">NEXT_PUBLIC_EMBED_BASE_URL</code> in{' '}
          <code className="text-red-400">.env.local</code>.
        </p>
      </div>
    )
  }

  const src =
    type === 'movie'
      ? `${base}/movie/${id}`
      : `${base}/tv/${id}/${season ?? 1}/${episode ?? 1}`

  return (
    <iframe
      src={src}
      title="Video Player"
      className="w-full aspect-video rounded-lg"
      sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
      referrerPolicy="origin"
      allowFullScreen={true}
    />
  )
}
