'use client'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

export function BackButton() {
  const router = useRouter()
  return (
    <button
      onClick={() => router.back()}
      className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm"
    >
      <ArrowLeft size={16} /> Back
    </button>
  )
}
