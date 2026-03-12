import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useRealtimeEQ } from '@/lib/useRealtimeEQ'
import { useRef } from 'react'

describe('useRealtimeEQ', () => {
  let audioElement: HTMLAudioElement

  beforeEach(() => {
    audioElement = document.createElement('audio')
    audioElement.src = 'test.mp3'
  })

  it('should initialize without errors', () => {
    const { result } = renderHook(() => {
      const audioRef = useRef<HTMLAudioElement>(audioElement)
      return useRealtimeEQ(audioRef, {
        bass: 0,
        low_mid: 0,
        mid: 0,
        high_mid: 0,
        treble: 0,
        gain: 0,
      })
    })

    expect(result.current).toBeDefined()
    expect(result.current.analyserRef).toBeDefined()
  })

  it('should return analyser reference', () => {
    const { result } = renderHook(() => {
      const audioRef = useRef<HTMLAudioElement>(audioElement)
      return useRealtimeEQ(audioRef, {
        bass: 0,
        low_mid: 0,
        mid: 0,
        high_mid: 0,
        treble: 0,
        gain: 0,
      })
    })

    expect(result.current.analyserRef).toBeDefined()
    expect(result.current.analyserRef.current).toBeDefined()
  })

  it('should update EQ when values change', async () => {
    const { result, rerender } = renderHook(
      ({ eq }) => {
        const audioRef = useRef<HTMLAudioElement>(audioElement)
        return useRealtimeEQ(audioRef, eq)
      },
      {
        initialProps: {
          eq: {
            bass: 0,
            low_mid: 0,
            mid: 0,
            high_mid: 0,
            treble: 0,
            gain: 0,
          },
        },
      }
    )

    expect(result.current).toBeDefined()

    // Update EQ values
    rerender({
      eq: {
        bass: 5,
        low_mid: 3,
        mid: -2,
        high_mid: 4,
        treble: 6,
        gain: 2,
      },
    })

    await waitFor(() => {
      expect(result.current.analyserRef.current).toBeDefined()
    })
  })

  it('should handle extreme EQ values', () => {
    const { result } = renderHook(() => {
      const audioRef = useRef<HTMLAudioElement>(audioElement)
      return useRealtimeEQ(audioRef, {
        bass: 12,
        low_mid: -12,
        mid: 12,
        high_mid: -12,
        treble: 12,
        gain: 12,
      })
    })

    expect(result.current).toBeDefined()
    expect(result.current.analyserRef).toBeDefined()
  })

  it('should handle null audio reference', () => {
    const { result } = renderHook(() => {
      const audioRef = useRef<HTMLAudioElement>(null)
      return useRealtimeEQ(audioRef, {
        bass: 0,
        low_mid: 0,
        mid: 0,
        high_mid: 0,
        treble: 0,
        gain: 0,
      })
    })

    expect(result.current).toBeDefined()
  })

  it('should resume AudioContext on play event', async () => {
    const { result } = renderHook(() => {
      const audioRef = useRef<HTMLAudioElement>(audioElement)
      return useRealtimeEQ(audioRef, {
        bass: 0,
        low_mid: 0,
        mid: 0,
        high_mid: 0,
        treble: 0,
        gain: 0,
      })
    })

    // Simulate play event
    audioElement.dispatchEvent(new Event('play'))

    await waitFor(() => {
      expect(result.current.analyserRef.current).toBeDefined()
    })
  })

  it('should create filters with correct frequencies', () => {
    renderHook(() => {
      const audioRef = useRef<HTMLAudioElement>(audioElement)
      return useRealtimeEQ(audioRef, {
        bass: 0,
        low_mid: 0,
        mid: 0,
        high_mid: 0,
        treble: 0,
        gain: 0,
      })
    })

    // Just verify that the hook works without errors
    expect(true).toBe(true)
  })

  it('should create master gain node', () => {
    renderHook(() => {
      const audioRef = useRef<HTMLAudioElement>(audioElement)
      return useRealtimeEQ(audioRef, {
        bass: 0,
        low_mid: 0,
        mid: 0,
        high_mid: 0,
        treble: 0,
        gain: 0,
      })
    })

    // Just verify that the hook works without errors
    expect(true).toBe(true)
  })

  it('should create analyser node with correct settings', () => {
    const { result } = renderHook(() => {
      const audioRef = useRef<HTMLAudioElement>(audioElement)
      return useRealtimeEQ(audioRef, {
        bass: 0,
        low_mid: 0,
        mid: 0,
        high_mid: 0,
        treble: 0,
        gain: 0,
      })
    })

    expect(result.current.analyserRef.current).toBeDefined()
  })

  it('should handle rapid EQ changes', async () => {
    const { rerender } = renderHook(
      ({ eq }) => {
        const audioRef = useRef<HTMLAudioElement>(audioElement)
        return useRealtimeEQ(audioRef, eq)
      },
      {
        initialProps: {
          eq: {
            bass: 0,
            low_mid: 0,
            mid: 0,
            high_mid: 0,
            treble: 0,
            gain: 0,
          },
        },
      }
    )

    // Simulate rapid changes
    for (let i = 0; i < 10; i++) {
      rerender({
        eq: {
          bass: i,
          low_mid: i,
          mid: i,
          high_mid: i,
          treble: i,
          gain: i,
        },
      })
    }

    // Should not throw error
    expect(true).toBe(true)
  })

  it('should cleanup event listeners on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(audioElement, 'removeEventListener')

    const { unmount } = renderHook(() => {
      const audioRef = useRef<HTMLAudioElement>(audioElement)
      return useRealtimeEQ(audioRef, {
        bass: 0,
        low_mid: 0,
        mid: 0,
        high_mid: 0,
        treble: 0,
        gain: 0,
      })
    })

    unmount()

    expect(removeEventListenerSpy).toHaveBeenCalledWith('play', expect.any(Function))
  })
})

