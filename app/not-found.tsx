import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="pt-16 min-h-screen flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-8xl font-bold text-red-600 mb-4">404</h1>
      <h2 className="text-2xl font-bold text-white mb-2">Page Not Found</h2>
      <p className="text-zinc-400 mb-8">The page you're looking for doesn't exist.</p>
      <Link href="/" className="bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-3 rounded-md transition-colors">
        Go Home
      </Link>
    </div>
  )
}
