import { describe, it, expect } from 'vitest'
import type { EQ } from '@/lib/eq'
import type { Track, TrackStatus, UploadStatus } from '@/lib/audio'

describe('Type Definitions', () => {
  describe('EQ type', () => {
    it('should have correct properties', () => {
      const eq: EQ = {
        bass: 0,
        low_mid: 0,
        mid: 0,
        high_mid: 0,
        treble: 0,
        gain: 0,
      }

      expect(eq).toHaveProperty('bass')
      expect(eq).toHaveProperty('low_mid')
      expect(eq).toHaveProperty('mid')
      expect(eq).toHaveProperty('high_mid')
      expect(eq).toHaveProperty('treble')
      expect(eq).toHaveProperty('gain')
    })

    it('should accept numeric values', () => {
      const eq: EQ = {
        bass: -12,
        low_mid: 6,
        mid: 0,
        high_mid: -3,
        treble: 12,
        gain: 5,
      }

      expect(typeof eq.bass).toBe('number')
      expect(typeof eq.low_mid).toBe('number')
      expect(typeof eq.mid).toBe('number')
      expect(typeof eq.high_mid).toBe('number')
      expect(typeof eq.treble).toBe('number')
      expect(typeof eq.gain).toBe('number')
    })
  })

  describe('TrackStatus type', () => {
    it('should accept valid status values', () => {
      const validStatuses: TrackStatus[] = ['idle', 'processing', 'done']

      validStatuses.forEach(status => {
        expect(['idle', 'processing', 'done']).toContain(status)
      })
    })
  })

  describe('UploadStatus type', () => {
    it('should accept valid upload status values', () => {
      const validStatuses: UploadStatus[] = [
        'idle',
        'uploading',
        'processing',
        'complete',
        'recording',
      ]

      validStatuses.forEach(status => {
        expect([
          'idle',
          'uploading',
          'processing',
          'complete',
          'recording',
        ]).toContain(status)
      })
    })
  })

  describe('Track type', () => {
    it('should have required properties', () => {
      const mockAudioBuffer = {
        length: 44100,
        duration: 1,
        sampleRate: 44100,
        numberOfChannels: 2,
        getChannelData: () => new Float32Array(44100),
        copyFromChannel: () => {},
        copyToChannel: () => {},
      } as AudioBuffer

      const track: Track = {
        id: 'track-1',
        name: 'Test Track',
        status: 'done',
        audioBuffer: mockAudioBuffer,
      }

      expect(track).toHaveProperty('id')
      expect(track).toHaveProperty('name')
      expect(track).toHaveProperty('status')
      expect(track).toHaveProperty('audioBuffer')
    })

    it('should allow optional properties', () => {
      const mockAudioBuffer = {
        length: 44100,
        duration: 1,
        sampleRate: 44100,
        numberOfChannels: 2,
        getChannelData: () => new Float32Array(44100),
        copyFromChannel: () => {},
        copyToChannel: () => {},
      } as AudioBuffer

      const track: Track = {
        id: 'track-2',
        name: 'Full Track',
        status: 'done',
        originalUrl: 'https://example.com/original.mp3',
        processedUrl: 'https://example.com/processed.mp3',
        originalFile: new File([''], 'test.mp3'),
        audioBuffer: mockAudioBuffer,
        processedAudioBuffer: mockAudioBuffer,
        genre: 'Rock',
        confidence: 0.95,
      }

      expect(track.originalUrl).toBe('https://example.com/original.mp3')
      expect(track.processedUrl).toBe('https://example.com/processed.mp3')
      expect(track.originalFile).toBeInstanceOf(File)
      expect(track.processedAudioBuffer).toBeDefined()
      expect(track.genre).toBe('Rock')
      expect(track.confidence).toBe(0.95)
    })

    it('should only accept "done" status', () => {
      const mockAudioBuffer = {
        length: 44100,
        duration: 1,
        sampleRate: 44100,
        numberOfChannels: 2,
        getChannelData: () => new Float32Array(44100),
        copyFromChannel: () => {},
        copyToChannel: () => {},
      } as AudioBuffer

      const track: Track = {
        id: 'track-3',
        name: 'Done Track',
        status: 'done',
        audioBuffer: mockAudioBuffer,
      }

      expect(track.status).toBe('done')
    })
  })
})

