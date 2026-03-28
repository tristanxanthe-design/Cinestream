'use client'
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Trash2, List } from 'lucide-react'
import { useLists } from '@/context/ListsContext'
import { posterURL } from '@/lib/constants'

export default function ListsPage() {
  const { lists, createList, deleteList, removeFromList } = useLists()
  const [newName, setNewName] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim()) return
    createList(newName)
    setNewName('')
  }

  return (
    <div className="pt-20 min-h-screen px-6 md:px-12 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-8">My Lists</h1>

      {/* Create list form */}
      <form onSubmit={handleCreate} className="flex gap-3 mb-8">
        <input
          value={newName}
          onChange={e => setNewName(e.target.value)}
          placeholder="New list name..."
          className="flex-1 bg-zinc-900 border border-zinc-700 rounded-md px-4 py-2 text-white text-sm outline-none focus:border-zinc-500"
        />
        <button type="submit" className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2 rounded-md transition-colors text-sm">
          Create List
        </button>
      </form>

      {lists.length === 0 ? (
        <p className="text-zinc-500 text-sm text-center py-12">No lists yet. Create one above or add items from a movie/TV page.</p>
      ) : (
        <div className="space-y-4">
          {lists.map(list => (
            <div key={list.id} className="bg-zinc-900 rounded-lg overflow-hidden">
              {/* List header */}
              <div className="flex items-center justify-between px-4 py-3">
                <button
                  onClick={() => setExpanded(expanded === list.id ? null : list.id)}
                  className="flex items-center gap-2 text-white font-medium hover:text-zinc-300 transition-colors"
                >
                  <List size={16} />
                  {list.name}
                  <span className="text-zinc-500 text-sm font-normal">({list.items.length})</span>
                </button>
                <button
                  onClick={() => deleteList(list.id)}
                  className="text-zinc-500 hover:text-red-400 transition-colors"
                  aria-label="Delete list"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {/* Expanded items */}
              {expanded === list.id && (
                <div className="border-t border-zinc-800 px-4 py-3">
                  {list.items.length === 0 ? (
                    <p className="text-zinc-500 text-sm">No items yet.</p>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                      {list.items.map(item => (
                        <div key={`${item.id}-${item.type}`} className="group relative">
                          <Link href={`/${item.type}/${item.id}`}>
                            <div className="relative aspect-[2/3] bg-zinc-800 rounded overflow-hidden">
                              <Image
                                src={posterURL(item.poster_path)}
                                alt={item.title}
                                fill
                                loading="lazy"
                                className="object-cover group-hover:scale-105 transition-transform duration-200"
                                sizes="120px"
                              />
                            </div>
                            <p className="text-xs text-zinc-400 truncate mt-1">{item.title}</p>
                          </Link>
                          <button
                            onClick={() => removeFromList(list.id, item.id)}
                            className="absolute top-1 right-1 bg-black/60 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label="Remove from list"
                          >
                            <Trash2 size={10} className="text-red-400" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
