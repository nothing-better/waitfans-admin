import { describe, expect, it } from 'vitest'
import reducer, { setLoading } from './appSlice'

describe('appSlice', () => {
  it('updates the global loading state', () => {
    expect(reducer(undefined, setLoading(true)).isLoading).toBe(true)
    expect(reducer(undefined, setLoading(false)).isLoading).toBe(false)
  })
})
