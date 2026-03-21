export function SkeletonCard() {
  return (
    <div className="shrink-0 w-36 md:w-44 animate-pulse">
      <div className="aspect-[2/3] bg-zinc-800 rounded-lg mb-2" />
      <div className="h-3 bg-zinc-800 rounded w-3/4" />
    </div>
  )
}
