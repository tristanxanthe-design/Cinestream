'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Search, Menu, X } from 'lucide-react'

const NAV_LINKS = [
  { label: 'Movies', href: '/browse/movies' },
  { label: 'TV Shows', href: '/browse/tv' },
  { label: 'Anime', href: '/browse/tv?genre=16' },
  { label: 'Collections', href: '/collections' },
]

export function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  // Close mobile menu on Escape key
  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])

  function isActive(href: string) {
    // For links with query strings, match only the pathname portion
    const linkPath = href.split('?')[0]
    return pathname === linkPath
  }

  return (
    <>
      {/* P3-3: aria-label on nav */}
      <nav
        aria-label="Main navigation"
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-[rgba(5,5,7,0.85)] backdrop-blur-xl border-b border-[rgba(255,255,255,0.06)]'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-screen-xl mx-auto px-6 h-16 flex items-center justify-between">

          {/* P3-4: aria-label on logo Link; aria-hidden on both inner spans */}
          <Link href="/" aria-label="CineStream" className="flex items-center gap-0.5 shrink-0">
            {/* P2-1: replace #7832ff / #e50914 with CSS variables */}
            <span
              aria-hidden="true"
              style={{
                fontFamily: "'Syne', sans-serif",
                fontWeight: 800,
                fontSize: '20px',
                background: 'linear-gradient(135deg, var(--purple), var(--red))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              CINE
            </span>
            <span
              aria-hidden="true"
              style={{
                fontFamily: "'Syne', sans-serif",
                fontWeight: 800,
                fontSize: '20px',
                color: '#ffffff',
              }}
            >
              STREAM
            </span>
          </Link>

          {/* Nav links — hidden below md */}
          <div className="hidden md:flex items-center gap-7">
            {NAV_LINKS.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 500, fontSize: '13px' }}
                className={`nav-link transition-colors ${
                  isActive(href)
                    ? 'text-white active'
                    : 'text-[rgba(255,255,255,0.6)] hover:text-white'
                }`}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Search icon — hidden below md, hamburger replaces on mobile */}
            <button
              onClick={() => router.push('/search')}
              aria-label="Search"
              className="hidden md:flex items-center justify-center w-11 h-11 rounded-full text-[rgba(255,255,255,0.5)] hover:text-white transition-colors"
            >
              <Search size={18} />
            </button>

            {/* Avatar pill — hidden below md */}
            {/* P2-1: avatar gradient via inline style using CSS variables */}
            <div className="hidden md:flex items-center gap-2 glass rounded-full px-3 py-1.5 cursor-pointer hover:border-[rgba(255,255,255,0.15)] transition-all">
              <div
                style={{
                  width: '26px',
                  height: '26px',
                  background: 'linear-gradient(135deg, var(--purple), var(--red))',
                }}
                className="rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
              >
                X
              </div>
              <span
                style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 500, fontSize: '13px' }}
                className="text-white hidden sm:block"
              >
                Xanthe
              </span>
            </div>

            {/* P0-1: Hamburger — visible below md, wired to toggle menuOpen */}
            <button
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              onClick={() => setMenuOpen(o => !o)}
              className="md:hidden flex items-center justify-center w-11 h-11 rounded-full text-[rgba(255,255,255,0.5)] hover:text-white transition-colors"
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>

        </div>
      </nav>

      {/* P0-1: Mobile nav panel */}
      {menuOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-30 bg-black/60" onClick={() => setMenuOpen(false)} />
          {/* Panel */}
          <div id="mobile-nav" className="fixed inset-x-0 top-16 z-40 bg-[rgba(5,5,7,0.97)] backdrop-blur-xl border-b border-[rgba(255,255,255,0.06)] p-5 md:hidden">
            <nav aria-label="Mobile navigation" className="flex flex-col gap-1">
              {/* All nav links + search */}
              {[
                { label: 'Movies', href: '/browse/movies' },
                { label: 'TV Shows', href: '/browse/tv' },
                { label: 'Anime', href: '/browse/tv?genre=16' },
                { label: 'Collections', href: '/collections' },
                { label: 'Search', href: '/search' },
                { label: 'Watchlist', href: '/watchlist' },
              ].map(link => (
                <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)}
                  className={`px-4 py-3 rounded-[10px] text-sm transition-colors ${
                    pathname === link.href ? 'text-white bg-[rgba(255,255,255,0.05)]' : 'text-[rgba(255,255,255,0.6)] hover:text-white hover:bg-[rgba(255,255,255,0.03)]'
                  }`}
                  style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 500, fontSize: '13px' }}>
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </>
      )}
    </>
  )
}
