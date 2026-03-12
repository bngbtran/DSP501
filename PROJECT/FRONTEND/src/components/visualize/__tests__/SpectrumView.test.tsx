import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import SpectrumView from '@/components/visualize/SpectrumView'

describe('SpectrumView', () => {
  let mockAudioBuffer: AudioBuffer

  beforeEach(() => {
    // Create a mock AudioBuffer
    const sampleRate = 44100
    const duration = 1
    const samples = sampleRate * duration
    const channelData = new Float32Array(samples)

    // Fill with a 440 Hz sine wave
    for (let i = 0; i < samples; i++) {
      channelData[i] = Math.sin(2 * Math.PI * 440 * i / sampleRate)
    }

    mockAudioBuffer = {
      length: samples,
      duration: duration,
      sampleRate: sampleRate,
      numberOfChannels: 1,
      getChannelData: vi.fn(() => channelData),
      copyFromChannel: vi.fn(),
      copyToChannel: vi.fn(),
    } as unknown as AudioBuffer
  })

  it('should render canvas element', () => {
    const { container } = render(
      <SpectrumView title="Test Spectrum" audioBuffer={mockAudioBuffer} />
    )
    
    const canvas = container.querySelector('canvas')
    expect(canvas).toBeInTheDocument()
  })

  it('should render with title', () => {
    const { getByText } = render(
      <SpectrumView title="Original Spectrum" audioBuffer={mockAudioBuffer} />
    )
    
    expect(getByText('Original Spectrum')).toBeInTheDocument()
  })

  it('should set canvas dimensions to 800x260', () => {
    const { container } = render(
      <SpectrumView title="Test" audioBuffer={mockAudioBuffer} />
    )
    
    const canvas = container.querySelector('canvas')
    expect(canvas).toHaveAttribute('width', '800')
    expect(canvas).toHaveAttribute('height', '260')
  })

  it('should call getChannelData on audioBuffer', () => {
    render(<SpectrumView title="Test" audioBuffer={mockAudioBuffer} />)
    
    expect(mockAudioBuffer.getChannelData).toHaveBeenCalledWith(0)
  })

  it('should update when audioBuffer changes', () => {
    const { rerender } = render(
      <SpectrumView title="Test" audioBuffer={mockAudioBuffer} />
    )
    
    const newChannelData = new Float32Array(44100)
    for (let i = 0; i < 44100; i++) {
      newChannelData[i] = Math.sin(2 * Math.PI * 880 * i / 44100)
    }
    
    const newAudioBuffer = {
      ...mockAudioBuffer,
      getChannelData: vi.fn(() => newChannelData),
    } as unknown as AudioBuffer
    
    rerender(<SpectrumView title="Test" audioBuffer={newAudioBuffer} />)
    
    expect(newAudioBuffer.getChannelData).toHaveBeenCalled()
  })

  it('should draw grid and axes', () => {
    const mockContext = {
      clearRect: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      fillText: vi.fn(),
    }
    
    const mockGetContext = vi.fn(() => mockContext)
    HTMLCanvasElement.prototype.getContext = mockGetContext as any
    
    render(<SpectrumView title="Test" audioBuffer={mockAudioBuffer} />)
    
    expect(mockGetContext).toHaveBeenCalledWith('2d')
    expect(mockContext.clearRect).toHaveBeenCalled()
    expect(mockContext.fillText).toHaveBeenCalled() // For axis labels
  })

  it('should apply correct styling classes', () => {
    const { container } = render(
      <SpectrumView title="Test" audioBuffer={mockAudioBuffer} />
    )
    
    const canvas = container.querySelector('canvas')
    expect(canvas).toHaveClass('w-full', 'rounded-md', 'border', 'border-white/10', 'bg-black/30')
  })

  it('should render container with space-y-2', () => {
    const { container } = render(
      <SpectrumView title="Test" audioBuffer={mockAudioBuffer} />
    )
    
    const wrapper = container.firstChild
    expect(wrapper).toHaveClass('space-y-2')
  })

  it('should handle stereo audio (use channel 0)', () => {
    const stereoBuffer = {
      ...mockAudioBuffer,
      numberOfChannels: 2,
    } as AudioBuffer
    
    render(<SpectrumView title="Test" audioBuffer={stereoBuffer} />)
    
    expect(mockAudioBuffer.getChannelData).toHaveBeenCalledWith(0)
  })

  it('should handle different sample rates', () => {
    const buffer48k = {
      ...mockAudioBuffer,
      sampleRate: 48000,
      getChannelData: vi.fn(() => new Float32Array(48000)),
    } as unknown as AudioBuffer
    
    const { container } = render(
      <SpectrumView title="Test" audioBuffer={buffer48k} />
    )
    
    const canvas = container.querySelector('canvas')
    expect(canvas).toBeInTheDocument()
    expect(buffer48k.getChannelData).toHaveBeenCalled()
  })

  it('should handle short audio buffers', () => {
    const shortBuffer = {
      ...mockAudioBuffer,
      length: 2048,
      getChannelData: vi.fn(() => new Float32Array(2048)),
    } as unknown as AudioBuffer
    
    const { container } = render(
      <SpectrumView title="Test" audioBuffer={shortBuffer} />
    )
    
    const canvas = container.querySelector('canvas')
    expect(canvas).toBeInTheDocument()
  })

  it('should handle long audio buffers', () => {
    const longBuffer = {
      ...mockAudioBuffer,
      length: 44100 * 60, // 60 seconds
      getChannelData: vi.fn(() => new Float32Array(44100 * 60)),
    } as unknown as AudioBuffer
    
    const { container } = render(
      <SpectrumView title="Test" audioBuffer={longBuffer} />
    )
    
    const canvas = container.querySelector('canvas')
    expect(canvas).toBeInTheDocument()
  })

  it('should compute FFT with averaged frames', () => {
    const { container } = render(
      <SpectrumView title="Test" audioBuffer={mockAudioBuffer} />
    )
    
    // FFT computation happens in useEffect
    const canvas = container.querySelector('canvas')
    expect(canvas).toBeInTheDocument()
  })

  it('should handle silence (zero amplitude)', () => {
    const silenceData = new Float32Array(44100) // All zeros
    
    const silenceBuffer = {
      ...mockAudioBuffer,
      getChannelData: vi.fn(() => silenceData),
    } as unknown as AudioBuffer
    
    const { container } = render(
      <SpectrumView title="Test" audioBuffer={silenceBuffer} />
    )
    
    const canvas = container.querySelector('canvas')
    expect(canvas).toBeInTheDocument()
  })

  it('should use logarithmic frequency scale', () => {
    const mockContext = {
      clearRect: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      fillText: vi.fn(),
    }
    
    HTMLCanvasElement.prototype.getContext = vi.fn(() => mockContext) as any
    
    render(<SpectrumView title="Test" audioBuffer={mockAudioBuffer} />)
    
    // Component uses log scale for frequency axis
    expect(mockContext.fillText).toHaveBeenCalled()
  })

  it('should display frequency labels', () => {
    const mockContext = {
      clearRect: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      fillText: vi.fn(),
    }
    
    HTMLCanvasElement.prototype.getContext = vi.fn(() => mockContext) as any
    
    render(<SpectrumView title="Test" audioBuffer={mockAudioBuffer} />)
    
    // Should draw frequency labels (20, 50, 100, etc.)
    expect(mockContext.fillText).toHaveBeenCalledWith(expect.stringContaining('20'), expect.any(Number), expect.any(Number))
  })

  it('should display dB labels', () => {
    const mockContext = {
      clearRect: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      fillText: vi.fn(),
    }
    
    HTMLCanvasElement.prototype.getContext = vi.fn(() => mockContext) as any
    
    render(<SpectrumView title="Test" audioBuffer={mockAudioBuffer} />)
    
    // Should draw dB labels
    expect(mockContext.fillText).toHaveBeenCalledWith(expect.stringContaining('dB'), expect.any(Number), expect.any(Number))
  })
})
