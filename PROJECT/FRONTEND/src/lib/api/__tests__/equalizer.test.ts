import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { applyEqualizer, type EqualizerParams, type EqualizerResponse } from '@/lib/api/equalizer'

describe('equalizer API', () => {
  const mockResponse: EqualizerResponse = {
    message: 'Success',
    download_url: 'https://example.com/processed.mp3',
    waveform: {
      original: [0.1, 0.2, 0.3],
      processed: [0.15, 0.25, 0.35],
    },
  }

  beforeEach(() => {
    vi.resetAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('applyEqualizer', () => {
    it('should send POST request with correct parameters', async () => {
      const mockFetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        } as Response)
      ) as any
      globalThis.fetch = mockFetch

      const params: EqualizerParams = {
        file: new File(['test'], 'test.mp3', { type: 'audio/mpeg' }),
        bass: 3,
        low_mid: 2,
        mid: 0,
        high_mid: -1,
        treble: 1,
        gain: 5,
      }

      const result = await applyEqualizer(params)

      expect(mockFetch).toHaveBeenCalledTimes(1)
      
      const callArgs = mockFetch.mock.calls[0] as any
      const url = callArgs[0] as string
      const options = callArgs[1] as any
      expect(url).toContain('/equalizer')
      expect(url).toContain('bass=3')
      expect(url).toContain('low_mid=2')
      expect(url).toContain('mid=0')
      expect(url).toContain('high_mid=-1')
      expect(url).toContain('treble=1')
      expect(url).toContain('gain=5')
      
      expect(options.method).toBe('POST')
      expect(options.body).toBeInstanceOf(FormData)
      
      expect(result).toEqual(mockResponse)
    })

    it('should handle File type correctly', async () => {
      const mockFetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        } as Response)
      ) as any
      globalThis.fetch = mockFetch

      const file = new File(['audio data'], 'song.mp3', { type: 'audio/mpeg' })
      
      const params: EqualizerParams = {
        file,
        bass: 0,
        low_mid: 0,
        mid: 0,
        high_mid: 0,
        treble: 0,
        gain: 0,
      }

      await applyEqualizer(params)

      const callArgs = mockFetch.mock.calls[0] as any
      const formData = callArgs[1]?.body as FormData
      expect(formData.get('file')).toBe(file)
    })

    it('should handle Blob type correctly', async () => {
      const mockFetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        } as Response)
      ) as any
      globalThis.fetch = mockFetch

      const blob = new Blob(['audio data'], { type: 'audio/webm' })
      
      const params: EqualizerParams = {
        file: blob,
        bass: 0,
        low_mid: 0,
        mid: 0,
        high_mid: 0,
        treble: 0,
        gain: 0,
      }

      await applyEqualizer(params)

      const callArgs = mockFetch.mock.calls[0] as any
      const formData = callArgs[1]?.body as FormData
      const file = formData.get('file')
      expect(file).toBeTruthy()
      expect(file).toBeInstanceOf(Blob)
    })

    it('should handle negative values', async () => {
      const mockFetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        } as Response)
      ) as any
      globalThis.fetch = mockFetch

      const params: EqualizerParams = {
        file: new File(['test'], 'test.mp3'),
        bass: -12,
        low_mid: -6,
        mid: -3,
        high_mid: -9,
        treble: -12,
        gain: -10,
      }

      await applyEqualizer(params)

      const callArgs = mockFetch.mock.calls[0] as any
      const url = callArgs[0] as string
      expect(url).toContain('bass=-12')
      expect(url).toContain('low_mid=-6')
      expect(url).toContain('mid=-3')
      expect(url).toContain('high_mid=-9')
      expect(url).toContain('treble=-12')
      expect(url).toContain('gain=-10')
    })

    it('should handle maximum values', async () => {
      const mockFetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        } as Response)
      ) as any
      globalThis.fetch = mockFetch

      const params: EqualizerParams = {
        file: new File(['test'], 'test.mp3'),
        bass: 12,
        low_mid: 12,
        mid: 12,
        high_mid: 12,
        treble: 12,
        gain: 12,
      }

      await applyEqualizer(params)

      const callArgs = mockFetch.mock.calls[0] as any
      const url = callArgs[0] as string
      expect(url).toContain('bass=12')
      expect(url).toContain('low_mid=12')
      expect(url).toContain('mid=12')
      expect(url).toContain('high_mid=12')
      expect(url).toContain('treble=12')
      expect(url).toContain('gain=12')
    })

    it('should throw error when response is not ok', async () => {
      const mockFetch = vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
        } as Response)
      ) as any
      globalThis.fetch = mockFetch

      const params: EqualizerParams = {
        file: new File(['test'], 'test.mp3'),
        bass: 0,
        low_mid: 0,
        mid: 0,
        high_mid: 0,
        treble: 0,
        gain: 0,
      }

      await expect(applyEqualizer(params)).rejects.toThrow('Equalizer failed')
    })

    it('should handle network errors', async () => {
      const mockFetch = vi.fn(() =>
        Promise.reject(new Error('Network error'))
      ) as any
      globalThis.fetch = mockFetch

      const params: EqualizerParams = {
        file: new File(['test'], 'test.mp3'),
        bass: 0,
        low_mid: 0,
        mid: 0,
        high_mid: 0,
        treble: 0,
        gain: 0,
      }

      await expect(applyEqualizer(params)).rejects.toThrow('Network error')
    })

    it('should return response with correct structure', async () => {
      const mockFetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        } as Response)
      ) as any
      globalThis.fetch = mockFetch

      const params: EqualizerParams = {
        file: new File(['test'], 'test.mp3'),
        bass: 0,
        low_mid: 0,
        mid: 0,
        high_mid: 0,
        treble: 0,
        gain: 0,
      }

      const result = await applyEqualizer(params)

      expect(result).toHaveProperty('message')
      expect(result).toHaveProperty('download_url')
      expect(result).toHaveProperty('waveform')
      expect(result.waveform).toHaveProperty('original')
      expect(result.waveform).toHaveProperty('processed')
      expect(Array.isArray(result.waveform.original)).toBe(true)
      expect(Array.isArray(result.waveform.processed)).toBe(true)
    })
  })
})
