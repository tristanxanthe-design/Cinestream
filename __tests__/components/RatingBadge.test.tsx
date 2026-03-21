import { render, screen } from '@testing-library/react'
import { RatingBadge } from '@/components/RatingBadge'

describe('RatingBadge', () => {
  it('shows green for rating >= 7.0', () => {
    const { container } = render(<RatingBadge rating={8.5} />)
    expect(container.firstChild).toHaveClass('bg-green-500')
    expect(screen.getByText('8.5')).toBeInTheDocument()
  })

  it('shows yellow for rating >= 5.0 and < 7.0', () => {
    const { container } = render(<RatingBadge rating={6.0} />)
    expect(container.firstChild).toHaveClass('bg-yellow-500')
  })

  it('shows red for rating < 5.0', () => {
    const { container } = render(<RatingBadge rating={4.9} />)
    expect(container.firstChild).toHaveClass('bg-red-500')
  })

  it('formats rating to one decimal', () => {
    render(<RatingBadge rating={7} />)
    expect(screen.getByText('7.0')).toBeInTheDocument()
  })
})
