import type { Metadata } from 'next'
import './globals.css'
import { WatchlistProvider } from '@/context/WatchlistContext'
import { Navbar } from '@/components/Navbar'

export const metadata: Metadata = {
  title: 'CineStream',
  description: 'Your local streaming experience',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#141414] text-white min-h-screen">
        <WatchlistProvider>
          <Navbar />
          <main>{children}</main>
        </WatchlistProvider>
      </body>
    </html>
  )
}
