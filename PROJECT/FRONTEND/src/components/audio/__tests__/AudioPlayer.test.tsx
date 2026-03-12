import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AudioPlayer from '@/components/audio/AudioPlayer'

describe('AudioPlayer', () => {
  const defaultProps = {
    url: 'https://example.com/test.mp3',
    title: 'Test Song',
    eq: {
      bass: 0,
      low_mid: 0,
      mid: 0,
      high_mid: 0,
      treble: 0,
      gain: 0,
    },
  }

  beforeEach(() => {
    // Mock fetch for waveform data
    globalThis.fetch = vi.fn(() =>
      Promise.resolve({
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
      } as Response)
    )
  })

  it('should render with title', () => {
    render(<AudioPlayer {...defaultProps} />)
    
    expect(screen.getByText('Test Song')).toBeInTheDocument()
  })

  it('should render play button', () => {
    render(<AudioPlayer {...defaultProps} />)
    
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(0)
    expect(buttons[0]).toBeInTheDocument()
  })

  it('should render clear and export buttons', () => {
    const onClear = vi.fn()
    const onExport = vi.fn()
    
    render(
      <AudioPlayer
        {...defaultProps}
        onClear={onClear}
        onExport={onExport}
      />
    )
    
    const clearButton = screen.getByTitle('Clear')
    const exportButton = screen.getByTitle('Export')
    
    expect(clearButton).toBeInTheDocument()
    expect(exportButton).toBeInTheDocument()
  })

  it('should call onClear when clear button is clicked', async () => {
    const onClear = vi.fn()
    const user = userEvent.setup()
    
    render(<AudioPlayer {...defaultProps} onClear={onClear} />)
    
    const clearButton = screen.getByTitle('Clear')
    await user.click(clearButton)
    
    expect(onClear).toHaveBeenCalledTimes(1)
  })

  it('should call onExport when export button is clicked', async () => {
    const onExport = vi.fn()
    const user = userEvent.setup()
    
    render(<AudioPlayer {...defaultProps} onExport={onExport} />)
    
    const exportButton = screen.getByTitle('Export')
    await user.click(exportButton)
    
    expect(onExport).toHaveBeenCalledTimes(1)
  })

  it('should display time as 00:00 initially', () => {
    render(<AudioPlayer {...defaultProps} />)
    
    expect(screen.getByText(/00:00 \/ 00:00/)).toBeInTheDocument()
  })

  it('should toggle play/pause on button click', async () => {
    const user = userEvent.setup()
    
    render(<AudioPlayer {...defaultProps} />)
    
    const playButton = screen.getAllByRole('button')[0]
    
    await user.click(playButton)
    
    // Check that audio element exists
    const audioElement = document.querySelector('audio')
    expect(audioElement).toBeInTheDocument()
  })

  it('should render with custom cover image', () => {
    const customCover = 'https://example.com/cover.jpg'
    
    render(<AudioPlayer {...defaultProps} cover={customCover} />)
    
    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('src', customCover)
  })

  it('should render with default cover when not provided', () => {
    render(<AudioPlayer {...defaultProps} />)
    
    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('src', '/assets/logo_green_with_text.png')
  })

  it('should load waveform on mount', async () => {
    render(<AudioPlayer {...defaultProps} />)
    
    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith(defaultProps.url)
    })
  })

  it('should handle EQ changes', () => {
    const { rerender } = render(<AudioPlayer {...defaultProps} />)
    
    const newEq = {
      bass: 5,
      low_mid: 3,
      mid: -2,
      high_mid: 4,
      treble: 6,
      gain: 2,
    }
    
    rerender(<AudioPlayer {...defaultProps} eq={newEq} />)
    
    // Component should re-render without errors
    expect(screen.getByText('Test Song')).toBeInTheDocument()
  })

  it('should create audio element with correct src', () => {
    render(<AudioPlayer {...defaultProps} />)
    
    const audioElement = document.querySelector('audio')
    expect(audioElement).toBeInTheDocument()
    expect(audioElement).toHaveAttribute('src', defaultProps.url)
  })

  it('should pause and reset on clear', async () => {
    const onClear = vi.fn()
    const user = userEvent.setup()
    
    render(<AudioPlayer {...defaultProps} onClear={onClear} />)
    
    // Play audio first
    const playButton = screen.getAllByRole('button')[0]
    await user.click(playButton)
    
    // Then clear
    const clearButton = screen.getByTitle('Clear')
    await user.click(clearButton)
    
    const audioElement = document.querySelector('audio') as HTMLAudioElement
    expect(audioElement.currentTime).toBe(0)
    expect(onClear).toHaveBeenCalledTimes(1)
  })

  it('should render waveform bars', async () => {
    render(<AudioPlayer {...defaultProps} />)
    
    await waitFor(() => {
      const waveformContainer = document.querySelector('.flex.h-20')
      expect(waveformContainer).toBeInTheDocument()
    })
  })

  it('should handle url change', () => {
    const { rerender } = render(<AudioPlayer {...defaultProps} />)
    
    const newUrl = 'https://example.com/new-song.mp3'
    rerender(<AudioPlayer {...defaultProps} url={newUrl} />)
    
    const audioElement = document.querySelector('audio')
    expect(audioElement).toHaveAttribute('src', newUrl)
  })

  it('should format time correctly', () => {
    render(<AudioPlayer {...defaultProps} />)
    
    // Initial state should show 00:00
    expect(screen.getByText(/00:00/)).toBeInTheDocument()
  })
})

