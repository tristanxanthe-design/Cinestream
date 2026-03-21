import { renderHook, act } from '@testing-library/react'
import { useLocalStorage } from '@/hooks/useLocalStorage'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value },
    clear: () => { store = {} },
  }
})()
Object.defineProperty(window, 'localStorage', { value: localStorageMock, configurable: true, writable: true })

beforeEach(() => localStorageMock.clear())

describe('useLocalStorage', () => {
  it('returns initial value before hydration', () => {
    const { result } = renderHook(() => useLocalStorage('test_key', 'initial'))
    expect(result.current[0]).toBe('initial')
  })

  it('reads from localStorage after hydration', async () => {
    localStorageMock.setItem('test_key', JSON.stringify('stored_value'))
    const { result } = renderHook(() => useLocalStorage('test_key', 'initial'))
    // Wait for useEffect to run
    await act(async () => {})
    expect(result.current[0]).toBe('stored_value')
  })

  it('updates localStorage when value changes', async () => {
    const { result } = renderHook(() => useLocalStorage<string>('test_key', 'initial'))
    await act(async () => {})
    act(() => result.current[1]('new_value'))
    await act(async () => {})
    expect(localStorageMock.getItem('test_key')).toBe(JSON.stringify('new_value'))
  })
})
