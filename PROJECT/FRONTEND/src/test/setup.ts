import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

afterEach(() => {
  cleanup()
})

globalThis.ResizeObserver = class ResizeObserver {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
} as any

class MockAudioContext {
  createMediaElementSource = vi.fn(() => ({
    connect: vi.fn(),
  }))

  createBiquadFilter = vi.fn(() => ({
    connect: vi.fn(),
    type: 'lowshelf',
    frequency: { value: 100, setValueAtTime: vi.fn() },
    Q: { value: 1, setValueAtTime: vi.fn() },
    gain: { value: 0, setValueAtTime: vi.fn() },
  }))

  createGain = vi.fn(() => ({
    connect: vi.fn(),
    gain: { value: 1, setValueAtTime: vi.fn() },
  }))

  createAnalyser = vi.fn(() => ({
    connect: vi.fn(),
    fftSize: 2048,
    smoothingTimeConstant: 0.8,
    getByteFrequencyData: vi.fn(),
    getByteTimeDomainData: vi.fn(),
  }))

  destination = {}
  state = 'running'
  resume = vi.fn()
  close = vi.fn()
  sampleRate = 44100

  decodeAudioData = vi.fn(() =>
    Promise.resolve({
      length: 44100,
      duration: 1,
      sampleRate: 44100,
      numberOfChannels: 2,
      getChannelData: vi.fn(() => new Float32Array(44100)),
    })
  )
}

globalThis.AudioContext = MockAudioContext as any

globalThis.MediaRecorder = vi.fn().mockImplementation(() => ({
  start: vi.fn(),
  stop: vi.fn(),
  ondataavailable: null,
  onstop: null,
  state: 'inactive',
  mimeType: 'audio/webm',
  stream: {
    getTracks: vi.fn(() => [
      {
        stop: vi.fn(),
      },
    ]),
  },
})) as any

Object.defineProperty(globalThis.navigator, 'mediaDevices', {
  writable: true,
  value: {
    getUserMedia: vi.fn(() =>
      Promise.resolve({
        getTracks: () => [
          {
            stop: vi.fn(),
          },
        ],
      })
    ),
  },
})

Object.defineProperty(HTMLMediaElement.prototype, 'play', {
  configurable: true,
  value: vi.fn(() => Promise.resolve()),
})

Object.defineProperty(HTMLMediaElement.prototype, 'pause', {
  configurable: true,
  value: vi.fn(),
})

Object.defineProperty(HTMLMediaElement.prototype, 'load', {
  configurable: true,
  value: vi.fn(),
})

if (!Element.prototype.setPointerCapture) {
  Element.prototype.setPointerCapture = vi.fn()
}
if (!Element.prototype.releasePointerCapture) {
  Element.prototype.releasePointerCapture = vi.fn()
}
if (!Element.prototype.hasPointerCapture) {
  Element.prototype.hasPointerCapture = vi.fn(() => false)
}

HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
  clearRect: vi.fn(),
  fillRect: vi.fn(),
  strokeRect: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  stroke: vi.fn(),
  fill: vi.fn(),
  arc: vi.fn(),
  fillText: vi.fn(),
  measureText: vi.fn(() => ({ width: 0 })),
  drawImage: vi.fn(),
  createLinearGradient: vi.fn(() => ({
    addColorStop: vi.fn(),
  })),
  save: vi.fn(),
  restore: vi.fn(),
  scale: vi.fn(),
  translate: vi.fn(),
  rotate: vi.fn(),
})) as any

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

globalThis.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
})) as any

globalThis.fetch = vi.fn()
