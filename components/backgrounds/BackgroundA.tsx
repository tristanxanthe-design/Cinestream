'use client';

import { useEffect } from 'react';

export function BackgroundA() {
  useEffect(() => {
    const el = document.getElementById('scroll-progress-a');
    const onScroll = () => {
      const pct =
        window.scrollY /
        (document.documentElement.scrollHeight - window.innerHeight);
      if (el) el.style.transform = `scaleX(${pct})`;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      {/* Scroll progress bar — fills left-to-right as user scrolls */}
      <div id="scroll-progress-a" aria-hidden="true" />

      {/* Perspective grid floor — deepens perspective on scroll */}
      <div
        className="grid-floor parallax-floor"
        data-parallax="floor"
        aria-hidden="true"
        style={{ pointerEvents: 'none' }}
      />

      {/* Ambient orb glows — drift at independent parallax rates */}
      <div
        className="orb orb-1 parallax-orb1"
        data-parallax="orb1"
        aria-hidden="true"
        style={{ pointerEvents: 'none' }}
      />
      <div
        className="orb orb-2 parallax-orb2"
        data-parallax="orb2"
        aria-hidden="true"
        style={{ pointerEvents: 'none' }}
      />
      <div
        className="orb orb-3 parallax-orb3"
        data-parallax="orb3"
        aria-hidden="true"
        style={{ pointerEvents: 'none' }}
      />
    </>
  );
}
