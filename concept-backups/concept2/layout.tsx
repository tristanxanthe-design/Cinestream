import type { Metadata } from 'next'
import './globals.css'
import './overdrive-a.css' // Overdrive direction A — change to overdrive-b.css or overdrive-c.css to switch
import { WatchlistProvider } from '@/context/WatchlistContext'
import { ProgressProvider } from '@/context/ProgressContext'
import { ListsProvider } from '@/context/ListsContext'
import { Navbar } from '@/components/Navbar'
import { BackgroundEffects } from '@/components/BackgroundEffects'
import { LayoutTransition } from '@/components/LayoutTransition'

export const metadata: Metadata = {
  title: 'CineStream',
  description: 'Your local streaming experience',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Syne:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-[var(--bg)] text-white min-h-screen">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:rounded-[10px] focus:text-white focus:text-sm focus:font-medium"
          style={{ background: 'var(--purple)' }}
        >
          Skip to content
        </a>
        <WatchlistProvider>
          <ProgressProvider>
            <ListsProvider>
              <BackgroundEffects />
              <Navbar />
              <main id="main-content" className="relative z-10 min-h-screen">
                <LayoutTransition>{children}</LayoutTransition>
              </main>
            </ListsProvider>
          </ProgressProvider>
        </WatchlistProvider>
      </body>
    </html>
  )
}
