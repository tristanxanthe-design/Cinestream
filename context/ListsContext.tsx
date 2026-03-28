'use client'
import { createContext, useContext } from 'react'
import { useLocalStorage } from '@/hooks/useLocalStorage'

interface ListItem {
  id: number
  type: 'movie' | 'tv'
  title: string
  poster_path: string | null
  addedAt: string
}

interface CustomList {
  id: string
  name: string
  createdAt: string
  items: ListItem[]
}

interface ListsContextType {
  lists: CustomList[]
  createList: (name: string) => void
  deleteList: (listId: string) => void
  addToList: (listId: string, item: ListItem) => void
  removeFromList: (listId: string, itemId: number) => void
  isInList: (listId: string, itemId: number) => boolean
}

const ListsContext = createContext<ListsContextType | null>(null)

export function ListsProvider({ children }: { children: React.ReactNode }) {
  const [lists, setLists] = useLocalStorage<CustomList[]>('cinestream_lists', [])

  function createList(name: string) {
    setLists(prev => [...prev, {
      id: crypto.randomUUID(),
      name: name.trim(),
      createdAt: new Date().toISOString(),
      items: [],
    }])
  }

  function deleteList(listId: string) {
    setLists(prev => prev.filter(l => l.id !== listId))
  }

  function addToList(listId: string, item: ListItem) {
    setLists(prev => prev.map(l =>
      l.id === listId && !l.items.some(i => i.id === item.id && i.type === item.type)
        ? { ...l, items: [...l.items, item] }
        : l
    ))
  }

  function removeFromList(listId: string, itemId: number) {
    setLists(prev => prev.map(l =>
      l.id === listId
        ? { ...l, items: l.items.filter(i => i.id !== itemId) }
        : l
    ))
  }

  function isInList(listId: string, itemId: number) {
    return lists.find(l => l.id === listId)?.items.some(i => i.id === itemId) ?? false
  }

  return (
    <ListsContext.Provider value={{ lists, createList, deleteList, addToList, removeFromList, isInList }}>
      {children}
    </ListsContext.Provider>
  )
}

export function useLists() {
  const ctx = useContext(ListsContext)
  if (!ctx) throw new Error('useLists must be used inside ListsProvider')
  return ctx
}
