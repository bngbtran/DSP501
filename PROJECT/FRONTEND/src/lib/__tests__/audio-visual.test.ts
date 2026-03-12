import { describe, it, expect, beforeEach } from 'vitest'
import { computeFFT_Averaged } from '@/lib/audio-visual'

describe('audio-visual', () => {
  describe('computeFFT_Averaged', () => {
    let testSignal: Float32Array

    beforeEach(() => {
      // Create a test signal: 440 Hz sine wave (A4 note)
      const sampleRate = 44100
      const duration = 1 // 1 second
      const frequency = 440 // Hz
      const samples = sampleRate * duration

      testSignal = new Float32Array(samples)
      for (let i = 0; i < samples; i++) {
        testSignal[i] = Math.sin(2 * Math.PI * frequency * i / sampleRate)
      }
    })

    it('should compute FFT with default parameters', () => {
      const result = computeFFT_Averaged(testSignal)
      
      expect(result).toBeDefined()
      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBe(1024) // half of default fftSize (2048)
    })

    it('should return array of correct length based on fftSize', () => {
      const fftSize = 4096
      const result = computeFFT_Averaged(testSignal, fftSize)
      
      expect(result.length).toBe(fftSize / 2)
    })

    it('should return dB values', () => {
      const result = computeFFT_Averaged(testSignal)
      
      // All values should be numbers
      result.forEach(value => {
        expect(typeof value).toBe('number')
        expect(isNaN(value)).toBe(false)
      })
    })

    it('should handle different hop sizes', () => {
      const result1 = computeFFT_Averaged(testSignal, 2048, 512)
      const result2 = computeFFT_Averaged(testSignal, 2048, 1024)
      
      expect(result1.length).toBe(result2.length)
      // Results might differ due to different averaging
      expect(result1).not.toEqual(result2)
    })

    it('should handle short signals', () => {
      const shortSignal = new Float32Array(2048)
      for (let i = 0; i < shortSignal.length; i++) {
        shortSignal[i] = Math.sin(2 * Math.PI * 440 * i / 44100)
      }
      
      const result = computeFFT_Averaged(shortSignal)
      
      expect(result).toBeDefined()
      expect(result.length).toBe(1024)
    })

    it('should handle zero signal', () => {
      const zeroSignal = new Float32Array(44100)
      const result = computeFFT_Averaged(zeroSignal)
      
      expect(result).toBeDefined()
      expect(result.length).toBe(1024)
      // All values should be very low (negative dB)
      result.forEach(value => {
        expect(value).toBeLessThan(-50)
      })
    })

    it('should have peak near expected frequency', () => {
      const result = computeFFT_Averaged(testSignal)
      const sampleRate = 44100
      const fftSize = 2048
      
      // Expected bin for 440 Hz
      const expectedBin = Math.floor(440 * fftSize / sampleRate)
      
      // Find peak
      let maxValue = -Infinity
      let maxIndex = 0
      for (let i = 0; i < result.length; i++) {
        if (result[i] > maxValue) {
          maxValue = result[i]
          maxIndex = i
        }
      }
      
      // Peak should be near expected frequency (within a few bins)
      expect(Math.abs(maxIndex - expectedBin)).toBeLessThan(5)
    })
  })
})
