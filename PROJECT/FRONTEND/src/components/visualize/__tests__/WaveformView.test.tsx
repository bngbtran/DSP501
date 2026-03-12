import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import { WaveformView } from '@/components/visualize/WaveformView'

describe('WaveformView', () => {
  const mockData = [0.1, 0.3, 0.5, 0.7, 0.4, 0.2, 0.6, 0.8]

  beforeEach(() => {
    // Clear any previous mock calls
    vi.clearAllMocks()
  })

  it('should render canvas element', () => {
    const { container } = render(
      <WaveformView title="Test Waveform" data={mockData} />
    )
    
    const canvas = container.querySelector('canvas')
    expect(canvas).toBeInTheDocument()
  })

  it('should render with title', () => {
    const { getByText } = render(
      <WaveformView title="Original Audio" data={mockData} />
    )
    
    expect(getByText('Original Audio')).toBeInTheDocument()
  })

  it('should set canvas dimensions', () => {
    const { container } = render(
      <WaveformView title="Test" data={mockData} />
    )
    
    const canvas = container.querySelector('canvas')
    expect(canvas).toHaveAttribute('width', '800')
    expect(canvas).toHaveAttribute('height', '120')
  })

  it('should handle empty data array', () => {
    const { container } = render(
      <WaveformView title="Empty" data={[]} />
    )
    
    const canvas = container.querySelector('canvas')
    expect(canvas).toBeInTheDocument()
  })

  it('should handle progress parameter', () => {
    const { container } = render(
      <WaveformView title="Test" data={mockData} progress={0.5} />
    )
    
    const canvas = container.querySelector('canvas')
    expect(canvas).toBeInTheDocument()
  })

  it('should handle full progress (1.0)', () => {
    const { container } = render(
      <WaveformView title="Test" data={mockData} progress={1.0} />
    )
    
    const canvas = container.querySelector('canvas')
    expect(canvas).toBeInTheDocument()
  })

  it('should handle zero progress', () => {
    const { container } = render(
      <WaveformView title="Test" data={mockData} progress={0} />
    )
    
    const canvas = container.querySelector('canvas')
    expect(canvas).toBeInTheDocument()
  })

  it('should update when data changes', () => {
    const { container, rerender } = render(
      <WaveformView title="Test" data={mockData} />
    )
    
    const newData = [0.2, 0.4, 0.6, 0.8]
    rerender(<WaveformView title="Test" data={newData} />)
    
    const canvas = container.querySelector('canvas')
    expect(canvas).toBeInTheDocument()
  })

  it('should update when progress changes', () => {
    const { container, rerender } = render(
      <WaveformView title="Test" data={mockData} progress={0.25} />
    )
    
    rerender(<WaveformView title="Test" data={mockData} progress={0.75} />)
    
    const canvas = container.querySelector('canvas')
    expect(canvas).toBeInTheDocument()
  })

  it('should handle large data arrays', () => {
    const largeData = Array(10000).fill(0).map(() => Math.random())
    
    const { container } = render(
      <WaveformView title="Large" data={largeData} />
    )
    
    const canvas = container.querySelector('canvas')
    expect(canvas).toBeInTheDocument()
  })

  it('should draw on canvas context', () => {
    const mockContext = {
      clearRect: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
    }
    
    const mockGetContext = vi.fn(() => mockContext)
    HTMLCanvasElement.prototype.getContext = mockGetContext as any
    
    render(<WaveformView title="Test" data={mockData} />)
    
    expect(mockGetContext).toHaveBeenCalledWith('2d')
    expect(mockContext.clearRect).toHaveBeenCalled()
  })

  it('should apply correct styling classes', () => {
    const { container } = render(
      <WaveformView title="Test" data={mockData} />
    )
    
    const canvas = container.querySelector('canvas')
    expect(canvas).toHaveClass('w-full', 'rounded-md', 'border', 'border-white/10', 'bg-black/30')
  })

  it('should render container with space-y-2', () => {
    const { container } = render(
      <WaveformView title="Test" data={mockData} />
    )
    
    const wrapper = container.firstChild
    expect(wrapper).toHaveClass('space-y-2')
  })

  it('should handle undefined data gracefully', () => {
    const { container } = render(
      <WaveformView title="Test" data={undefined as any} />
    )
    
    const canvas = container.querySelector('canvas')
    expect(canvas).toBeInTheDocument()
  })

  it('should handle negative values in data', () => {
    const dataWithNegatives = [-0.5, -0.3, 0.2, 0.4, -0.1]
    
    const { container } = render(
      <WaveformView title="Test" data={dataWithNegatives} />
    )
    
    const canvas = container.querySelector('canvas')
    expect(canvas).toBeInTheDocument()
  })

  it('should handle values outside [0,1] range', () => {
    const extremeData = [-2, -1, 0, 1, 2, 3]
    
    const { container } = render(
      <WaveformView title="Test" data={extremeData} />
    )
    
    const canvas = container.querySelector('canvas')
    expect(canvas).toBeInTheDocument()
  })
})
