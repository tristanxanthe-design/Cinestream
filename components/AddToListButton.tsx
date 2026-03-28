'use client'
import { useState, useRef, useEffect } from 'react'
import { ListPlus, Check } from 'lucide-react'
import { useLists } from '@/context/ListsContext'

interface Props {
  itemId: number
  itemType: 'movie' | 'tv'
  itemTitle: string
  posterPath: string | null
}

export function AddToListButton({ itemId, itemType, itemTitle, posterPath }: Props) {
  const { lists, addToList, removeFromList, isInList, createList } = useLists()
  const [open, setOpen] = useState(false)
  const [newListName, setNewListName] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  function handleToggle(listId: string) {
    if (isInList(listId, itemId)) {
      removeFromList(listId, itemId)
    } else {
      addToList(listId, { id: itemId, type: itemType, title: itemTitle, poster_path: posterPath, addedAt: new Date().toISOString() })
    }
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!newListName.trim()) return
    createList(newListName)
    setNewListName('')
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 border border-zinc-600 text-zinc-300 hover:text-white hover:border-zinc-400 font-semibold px-6 py-2.5 rounded-md transition-colors"
      >
        <ListPlus size={18} /> Add to List
      </button>

      {open && (
        <div className="absolute top-full mt-2 left-0 z-50 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl min-w-48 py-1">
          {lists.length === 0 && (
            <p className="text-zinc-500 text-xs px-4 py-2">No lists yet. Create one below.</p>
          )}
          {lists.map(list => (
            <button
              key={list.id}
              onClick={() => handleToggle(list.id)}
              className="w-full flex items-center justify-between gap-2 px-4 py-2 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <span className="truncate">{list.name}</span>
              {isInList(list.id, itemId) && <Check size={14} className="text-green-500 shrink-0" />}
            </button>
          ))}
          <div className="border-t border-zinc-700 mt-1 pt-1 px-3 pb-2">
            <form onSubmit={handleCreate} className="flex gap-1 mt-1">
              <input
                value={newListName}
                onChange={e => setNewListName(e.target.value)}
                placeholder="New list name..."
                className="flex-1 bg-zinc-800 text-white text-xs rounded px-2 py-1 outline-none border border-zinc-700 focus:border-zinc-500"
              />
              <button type="submit" className="text-xs bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded transition-colors">+</button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
