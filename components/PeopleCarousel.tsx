'use client'

import type { Person } from '@/lib/tmdb'
import { PersonCard } from './PersonCard'

interface Props {
  people: Person[]
}

export function PeopleCarousel({ people }: Props) {
  if (!people || people.length === 0) return null

  return (
    <section className="py-6">
      <h2 className="text-xl font-semibold text-white px-6 mb-4">Trending People</h2>
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex gap-4 px-6">
          {people.map(person => (
            <PersonCard key={person.id} person={person} />
          ))}
        </div>
      </div>
    </section>
  )
}
