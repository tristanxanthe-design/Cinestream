import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GenreFilter } from '@/components/GenreFilter'

const genres = [
  { id: 28, name: 'Action' },
  { id: 18, name: 'Drama' },
]

describe('GenreFilter', () => {
  it('renders all genres', () => {
    render(<GenreFilter genres={genres} selected={null} onSelect={() => {}} />)
    expect(screen.getByText('All')).toBeInTheDocument()
    expect(screen.getByText('Action')).toBeInTheDocument()
    expect(screen.getByText('Drama')).toBeInTheDocument()
  })

  it('calls onSelect with null when All is clicked', async () => {
    const user = userEvent.setup()
    const onSelect = jest.fn()
    render(<GenreFilter genres={genres} selected={28} onSelect={onSelect} />)
    await user.click(screen.getByText('All'))
    expect(onSelect).toHaveBeenCalledWith(null)
  })

  it('calls onSelect with genre id when genre is clicked', async () => {
    const user = userEvent.setup()
    const onSelect = jest.fn()
    render(<GenreFilter genres={genres} selected={null} onSelect={onSelect} />)
    await user.click(screen.getByText('Action'))
    expect(onSelect).toHaveBeenCalledWith(28)
  })
})
