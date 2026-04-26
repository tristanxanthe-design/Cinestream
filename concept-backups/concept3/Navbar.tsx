'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Bell, Search, Menu, X } from 'lucide-react'

const NAV_LINKS = [
  { label: 'Movies', href: '/browse/movies' },
  { label: 'TV Shows', href: '/browse/tv' },
  { label: 'Anime', href: '/browse/tv?genre=16' },
  { label: 'Collections', href: '/collections' },
]

const MOBILE_LINKS = NAV_LINKS

export function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  // Scroll listener
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  // Escape key closes mobile menu
  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])

  function isActive(href: string) {
    const linkPath = href.split('?')[0]
    return pathname === linkPath
  }

  return (
    <>
      {/* ── Main navbar ── */}
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          height: '64px',
          transition: 'background 0.3s cubic-bezier(0.25, 1, 0.5, 1), backdrop-filter 0.3s cubic-bezier(0.25, 1, 0.5, 1), border-color 0.3s cubic-bezier(0.25, 1, 0.5, 1)',
          background: scrolled ? 'rgba(3,3,5,0.85)' : 'transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'none',
          borderBottom: '1px solid',
          borderBottomColor: scrolled ? 'rgba(255,255,255,0.04)' : 'transparent',
        }}
      >
        <div
          style={{
            maxWidth: '1400px',
            margin: '0 auto',
            padding: '0 48px',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
          className="px-6 lg:px-12"
        >
          {/* Logo */}
          <Link
            href="/"
            aria-label="CineStream home"
            style={{ textDecoration: 'none', flexShrink: 0 }}
          >
            <span
              style={{
                fontFamily: 'Playfair Display, Georgia, serif',
                fontWeight: 800,
                fontSize: '20px',
                color: '#ffffff',
                letterSpacing: '-0.01em',
              }}
            >
              Cine
              <em style={{ fontStyle: 'normal', color: '#e50914' }}>S</em>
              tream
            </span>
          </Link>

          {/* Desktop nav links */}
          <nav aria-label="Main navigation" className="hidden md:flex items-center gap-7">
            {NAV_LINKS.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className={`nav-link${isActive(href) ? ' active' : ''}`}
                style={{
                  fontFamily: 'Instrument Sans, sans-serif',
                  fontWeight: 500,
                  fontSize: '12px',
                  color: isActive(href) ? '#ffffff' : 'rgba(255,255,255,0.3)',
                  textDecoration: 'none',
                  transition: 'color 0.2s cubic-bezier(0.25, 1, 0.5, 1)',
                  letterSpacing: '0.02em',
                  textTransform: 'uppercase',
                }}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Right-side controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>

            {/* Search pill — desktop only */}
            <button
              onClick={() => router.push('/search')}
              aria-label="Search"
              className="hidden md:flex items-center"
              style={{
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '20px',
                cursor: 'pointer',
                background: 'rgba(255,255,255,0.04)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.07)',
                transition: 'border-color 0.2s cubic-bezier(0.25, 1, 0.5, 1), background 0.2s cubic-bezier(0.25, 1, 0.5, 1)',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget
                el.style.background = 'rgba(255,255,255,0.07)'
                el.style.borderColor = 'rgba(255,255,255,0.12)'
              }}
              onMouseLeave={e => {
                const el = e.currentTarget
                el.style.background = 'rgba(255,255,255,0.04)'
                el.style.borderColor = 'rgba(255,255,255,0.07)'
              }}
            >
              <Search size={16} color="rgba(255,255,255,0.3)" />
              <span
                style={{
                  fontFamily: 'Instrument Sans, sans-serif',
                  fontSize: '12px',
                  color: 'rgba(255,255,255,0.3)',
                  whiteSpace: 'nowrap',
                }}
              >
                Search anything...
              </span>
              <kbd
                style={{
                  fontFamily: 'Instrument Sans, sans-serif',
                  fontSize: '9px',
                  color: 'rgba(255,255,255,0.15)',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  borderRadius: '4px',
                  padding: '2px 6px',
                  lineHeight: 1.4,
                }}
              >
                /
              </kbd>
            </button>

            {/* Notification bell */}
            <button
              aria-label="Notifications"
              style={{
                position: 'relative',
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                border: '1px solid rgba(255,255,255,0.08)',
                background: 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'border-color 0.2s cubic-bezier(0.25, 1, 0.5, 1), background 0.2s cubic-bezier(0.25, 1, 0.5, 1)',
                flexShrink: 0,
              }}
              onMouseEnter={e => {
                const el = e.currentTarget
                el.style.borderColor = 'rgba(255,255,255,0.18)'
                el.style.background = 'rgba(255,255,255,0.04)'
              }}
              onMouseLeave={e => {
                const el = e.currentTarget
                el.style.borderColor = 'rgba(255,255,255,0.08)'
                el.style.background = 'transparent'
              }}
            >
              <Bell size={16} color="rgba(255,255,255,0.55)" />
              {/* Red notification dot */}
              <span
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  top: '2px',
                  right: '2px',
                  width: '5px',
                  height: '5px',
                  borderRadius: '50%',
                  background: '#e50914',
                  flexShrink: 0,
                }}
              />
            </button>

            {/* Avatar — desktop only */}
            <div
              className="hidden md:flex items-center justify-center"
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                border: '2px solid rgba(229,9,20,0.4)',
                background: 'rgba(229,9,20,0.1)',
                flexShrink: 0,
                cursor: 'pointer',
              }}
            >
              <span
                style={{
                  fontFamily: 'Instrument Sans, sans-serif',
                  fontWeight: 600,
                  fontSize: '13px',
                  color: '#ffffff',
                  lineHeight: 1,
                }}
              >
                X
              </span>
            </div>

            {/* Hamburger — mobile only */}
            <button
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              onClick={() => setMenuOpen(o => !o)}
              className="md:hidden flex items-center justify-center"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.08)',
                cursor: 'pointer',
                color: 'rgba(255,255,255,0.6)',
                transition: 'border-color 0.2s cubic-bezier(0.25, 1, 0.5, 1), color 0.2s cubic-bezier(0.25, 1, 0.5, 1)',
              }}
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile panel ── */}
      {menuOpen && (
        <>
          {/* Backdrop overlay */}
          <div
            aria-hidden="true"
            onClick={() => setMenuOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 40,
              background: 'rgba(0,0,0,0.65)',
            }}
          />

          {/* Panel */}
          <div
            id="mobile-nav"
            className="md:hidden"
            style={{
              position: 'fixed',
              top: '64px',
              left: 0,
              right: 0,
              zIndex: 45,
              background: 'rgba(3,3,5,0.97)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              padding: '24px 24px 32px',
            }}
          >
            <nav aria-label="Mobile navigation">
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {MOBILE_LINKS.map(({ label, href }) => {
                  const active = isActive(href)
                  return (
                    <li key={href}>
                      <Link
                        href={href}
                        onClick={() => setMenuOpen(false)}
                        style={{
                          display: 'block',
                          padding: '12px 16px',
                          borderRadius: '10px',
                          fontFamily: 'Instrument Sans, sans-serif',
                          fontWeight: 500,
                          fontSize: '16px',
                          textDecoration: 'none',
                          color: active ? '#ffffff' : 'rgba(255,255,255,0.5)',
                          background: active ? 'rgba(255,255,255,0.05)' : 'transparent',
                          transition: 'color 0.2s cubic-bezier(0.25, 1, 0.5, 1), background 0.2s cubic-bezier(0.25, 1, 0.5, 1)',
                        }}
                      >
                        {label}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </nav>
          </div>
        </>
      )}
    </>
  )
}
