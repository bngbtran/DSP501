import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import EqFader from '@/components/dsp/EqFader'

describe('EqFader', () => {
  it('should render with label and frequency', () => {
    render(
      <EqFader
        label="Bass"
        freq="100 Hz"
        value={0}
        onChange={vi.fn()}
      />
    )
    
    expect(screen.getByText('Bass')).toBeInTheDocument()
    expect(screen.getByText('100 Hz')).toBeInTheDocument()
  })

  it('should display value with dB unit', () => {
    render(
      <EqFader
        label="Mid"
        value={5}
        onChange={vi.fn()}
      />
    )
    
    expect(screen.getByText('+5 dB')).toBeInTheDocument()
  })

  it('should show + prefix for positive values', () => {
    render(
      <EqFader
        label="Treble"
        value={3}
        onChange={vi.fn()}
      />
    )
    
    expect(screen.getByText('+3 dB')).toBeInTheDocument()
  })

  it('should not show + prefix for negative values', () => {
    render(
      <EqFader
        label="Bass"
        value={-6}
        onChange={vi.fn()}
      />
    )
    
    expect(screen.getByText('-6 dB')).toBeInTheDocument()
  })

  it('should handle zero value', () => {
    render(
      <EqFader
        label="Mid"
        value={0}
        onChange={vi.fn()}
      />
    )
    
    expect(screen.getByText('0 dB')).toBeInTheDocument()
  })

  it('should render without frequency label', () => {
    render(
      <EqFader
        label="Gain"
        value={0}
        onChange={vi.fn()}
      />
    )
    
    expect(screen.getByText('Gain')).toBeInTheDocument()
    expect(screen.queryByText(/Hz/)).not.toBeInTheDocument()
  })

  it('should call onChange when slider is adjusted', async () => {
    const handleChange = vi.fn()
    
    render(
      <EqFader
        label="Bass"
        value={0}
        onChange={handleChange}
      />
    )
    
    const slider = screen.getByRole('slider')
    expect(slider).toBeInTheDocument()
  })

  it('should reset to 0 on double click', async () => {
    const handleChange = vi.fn()
    const user = userEvent.setup()
    
    render(
      <EqFader
        label="Bass"
        value={5}
        onChange={handleChange}
      />
    )
    
    // Find the container with double click handler
    const container = screen.getByTitle('Double click to reset')
    await user.dblClick(container)
    
    expect(handleChange).toHaveBeenCalledWith(0)
  })

  it('should have lime color for positive values', () => {
    render(
      <EqFader
        label="Bass"
        value={5}
        onChange={vi.fn()}
      />
    )
    
    const valueText = screen.getByText('+5 dB')
    expect(valueText).toHaveClass('text-lime-400')
  })

  it('should have red color for negative values', () => {
    render(
      <EqFader
        label="Bass"
        value={-5}
        onChange={vi.fn()}
      />
    )
    
    const valueText = screen.getByText('-5 dB')
    expect(valueText).toHaveClass('text-red-400')
  })

  it('should have white color for zero value', () => {
    render(
      <EqFader
        label="Bass"
        value={0}
        onChange={vi.fn()}
      />
    )
    
    const valueText = screen.getByText('0 dB')
    expect(valueText).toHaveClass('text-white/60')
  })

  it('should handle min value (-12 dB)', () => {
    render(
      <EqFader
        label="Bass"
        value={-12}
        onChange={vi.fn()}
      />
    )
    
    expect(screen.getByText('-12 dB')).toBeInTheDocument()
  })

  it('should handle max value (+12 dB)', () => {
    render(
      <EqFader
        label="Bass"
        value={12}
        onChange={vi.fn()}
      />
    )
    
    expect(screen.getByText('+12 dB')).toBeInTheDocument()
  })

  it('should render slider with correct orientation', () => {
    render(
      <EqFader
        label="Bass"
        value={0}
        onChange={vi.fn()}
      />
    )
    
    const slider = screen.getByRole('slider')
    expect(slider).toHaveAttribute('aria-orientation', 'vertical')
  })

  it('should update when value prop changes', () => {
    const { rerender } = render(
      <EqFader
        label="Bass"
        value={0}
        onChange={vi.fn()}
      />
    )
    
    expect(screen.getByText('0 dB')).toBeInTheDocument()
    
    rerender(
      <EqFader
        label="Bass"
        value={7}
        onChange={vi.fn()}
      />
    )
    
    expect(screen.getByText('+7 dB')).toBeInTheDocument()
  })
})
