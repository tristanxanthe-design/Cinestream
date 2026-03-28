import type { Metadata } from 'next'
import './globals.css'
import { WatchlistProvider } from '@/context/WatchlistContext'
import { ProgressProvider } from '@/context/ProgressContext'
import { ListsProvider } from '@/context/ListsContext'
import { Navbar } from '@/components/Navbar'
import { LayoutTransition } from '@/components/LayoutTransition'

export const metadata: Metadata = {
  title: 'CineStream',
  description: 'Your local streaming experience',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#141414] text-white min-h-screen">
        <WatchlistProvider>
          <ProgressProvider>
            <ListsProvider>
              <Navbar />
              <main>
                <LayoutTransition>{children}</LayoutTransition>
              </main>
            </ListsProvider>
          </ProgressProvider>
        </WatchlistProvider>
      </body>
    </html>
  )
}
