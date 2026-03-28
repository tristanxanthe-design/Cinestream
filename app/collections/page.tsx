import Link from 'next/link'
import Image from 'next/image'
import { getCollection } from '@/lib/tmdb'
import { backdropURL } from '@/lib/constants'

export const metadata = { title: 'Collections — CineStream' }

const COLLECTIONS = [
  { id: 10,     name: 'Star Wars' },
  { id: 131296, name: 'Marvel Cinematic Universe' },
  { id: 1241,   name: 'Harry Potter' },
  { id: 119,    name: 'Lord of the Rings' },
  { id: 528,    name: 'The Dark Knight' },
  { id: 2150,   name: 'Shrek' },
  { id: 87096,  name: 'Avatar' },
  { id: 748,    name: 'X-Men' },
  { id: 9485,   name: 'Fast & Furious' },
  { id: 656,    name: 'Pirates of the Caribbean' },
]

export default async function CollectionsPage() {
  const collections = await Promise.all(
    COLLECTIONS.map(({ id }) => getCollection(id).catch(() => null))
  )

  return (
    <main className="pt-24 pb-12 px-6 md:px-12 min-h-screen">
      <h1 className="text-3xl font-bold text-white mb-8">Collections</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {collections.map((collection, i) => {
          const { id, name } = COLLECTIONS[i]
          const backdrop = collection?.backdrop_path ?? null
          return (
            <Link key={id} href={`/collections/${id}`}>
              <div className="relative aspect-video bg-zinc-800 rounded-lg overflow-hidden group">
                <Image
                  src={backdropURL(backdrop)}
                  alt={name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <span className="absolute bottom-0 left-0 right-0 text-white font-semibold text-sm p-3">
                  {name}
                </span>
              </div>
            </Link>
          )
        })}
      </div>
    </main>
  )
}
