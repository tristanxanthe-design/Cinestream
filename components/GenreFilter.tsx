import type { Genre } from '@/lib/types'

interface GenreFilterProps {
  genres: Genre[]
  selected: number | null
  onSelect: (id: number | null) => void
}

export function GenreFilter({ genres, selected, onSelect }: GenreFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
      <button
        onClick={() => onSelect(null)}
        className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
          selected === null ? 'bg-red-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-white'
        }`}
      >
        All
      </button>
      {genres.map((g) => (
        <button
          key={g.id}
          onClick={() => onSelect(g.id)}
          className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            selected === g.id ? 'bg-red-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-white'
          }`}
        >
          {g.name}
        </button>
      ))}
    </div>
  )
}
