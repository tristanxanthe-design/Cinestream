import { posterURL, backdropURL, TMDB_IMAGE_BASE } from '@/lib/constants'

describe('posterURL', () => {
  it('returns placeholder when path is null', () => {
    expect(posterURL(null)).toBe('/placeholder-poster.svg')
  })

  it('returns correct URL with default size w342', () => {
    expect(posterURL('/abc.jpg')).toBe(`${TMDB_IMAGE_BASE}/w342/abc.jpg`)
  })

  it('returns correct URL with custom size', () => {
    expect(posterURL('/abc.jpg', 'w500')).toBe(`${TMDB_IMAGE_BASE}/w500/abc.jpg`)
  })
})

describe('backdropURL', () => {
  it('returns placeholder when path is null', () => {
    expect(backdropURL(null)).toBe('/placeholder-backdrop.svg')
  })

  it('returns correct URL with default size w1280', () => {
    expect(backdropURL('/back.jpg')).toBe(`${TMDB_IMAGE_BASE}/w1280/back.jpg`)
  })
})
