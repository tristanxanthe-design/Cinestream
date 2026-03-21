import { renderHook, act } from '@testing-library/react'
import { useDebounce } from '@/hooks/useDebounce'

jest.useFakeTimers()

describe('useDebounce', () => {
  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('hello', 300))
    expect(result.current).toBe('hello')
  })

  it('does not update before delay', () => {
    const { result, rerender } = renderHook(({ val }) => useDebounce(val, 300), {
      initialProps: { val: 'hello' },
    })
    rerender({ val: 'world' })
    expect(result.current).toBe('hello')
  })

  it('updates after delay', () => {
    const { result, rerender } = renderHook(({ val }) => useDebounce(val, 300), {
      initialProps: { val: 'hello' },
    })
    rerender({ val: 'world' })
    act(() => jest.advanceTimersByTime(300))
    expect(result.current).toBe('world')
  })
})
