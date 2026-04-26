'use client'

export function BackgroundB() {
  return (
    <>
      {/* Perspective grid floor */}
      <div className="grid-floor" aria-hidden="true" />
      {/* Ambient orb glows */}
      <div className="orb orb-1" aria-hidden="true" />
      <div className="orb orb-2" aria-hidden="true" />
      <div className="orb orb-3" aria-hidden="true" />
    </>
  )
}
