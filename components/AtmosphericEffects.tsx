'use client'

import { useEffect } from 'react'

export default function AtmosphericEffects() {
  useEffect(() => {
    const bar = document.getElementById('scroll-progress')
    if (!bar) return
    const onScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight
      const pct = total > 0 ? window.scrollY / total : 0
      bar.style.transform = `scaleX(${pct})`
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      {/* Scroll progress bar — 2px red line */}
      <div id="scroll-progress" aria-hidden="true" />

      {/* Film grain noise overlay */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          pointerEvents: 'none',
          opacity: 0.025,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '200px 200px',
        }}
      />

      {/* Ambient glow 1 — red, top-center */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      >
        <div
          style={{
            width: '500px',
            height: '500px',
            marginTop: '-100px',
            borderRadius: '50%',
            background: 'rgba(229,9,20,0.04)',
            filter: 'blur(100px)',
            animation: 'ambient-float 8s cubic-bezier(0.25, 1, 0.5, 1) infinite',
            willChange: 'transform',
          }}
        />
      </div>

      {/* Ambient glow 2 — deep red, bottom-right */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          bottom: '10%',
          right: '5%',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'rgba(229,9,20,0.03)',
          filter: 'blur(100px)',
          pointerEvents: 'none',
          zIndex: 0,
          animation: 'ambient-float 8s cubic-bezier(0.25, 1, 0.5, 1) infinite',
          animationDelay: '4s',
          willChange: 'transform',
        }}
      />

      <style>{`
        @keyframes ambient-float {
          0%, 100% { transform: translate(0, 0); }
          50%       { transform: translate(20px, -20px); }
        }
        @media (prefers-reduced-motion: reduce) {
          #scroll-progress { display: none; }
          [style*="ambient-float"] { animation: none !important; }
        }
      `}</style>
    </>
  )
}
