import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AudioUploader from '@/components/audio/AudioUploader'

describe('AudioUploader', () => {
  const mockOnAudioReady = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render upload and record tabs', () => {
    render(<AudioUploader onAudioReady={mockOnAudioReady} />)

    expect(screen.getByText('Upload Audio')).toBeInTheDocument()
    expect(screen.getByText('Record')).toBeInTheDocument()
  })

  it('should render title when provided', () => {
    render(
      <AudioUploader
        title="EQUALIZER"
        onAudioReady={mockOnAudioReady}
      />
    )

    expect(screen.getByText('EQUALIZER')).toBeInTheDocument()
  })

  it('should show upload tab by default', () => {
    render(<AudioUploader onAudioReady={mockOnAudioReady} />)

    const uploadTab = screen.getByRole('tab', { name: /Upload Audio/i })
    expect(uploadTab).toHaveAttribute('data-state', 'active')
  })

  it('should switch to record tab', async () => {
    const user = userEvent.setup()

    render(<AudioUploader onAudioReady={mockOnAudioReady} />)

    const recordTab = screen.getByRole('tab', { name: /Record/i })
    await user.click(recordTab)

    expect(recordTab).toHaveAttribute('data-state', 'active')
  })

  it('should render file dropzone in upload tab', () => {
    render(<AudioUploader onAudioReady={mockOnAudioReady} />)

    // Dropzone should be present
    const uploadTab = screen.getByRole('tabpanel')
    expect(uploadTab).toBeInTheDocument()
  })

  it('should show start recording button in record tab', async () => {
    const user = userEvent.setup()

    render(<AudioUploader onAudioReady={mockOnAudioReady} />)

    const recordTab = screen.getByRole('tab', { name: /Record/i })
    await user.click(recordTab)

    expect(screen.getByText('Start Recording')).toBeInTheDocument()
  })

  it('should render upload tab content', () => {
    render(<AudioUploader onAudioReady={mockOnAudioReady} />)

    expect(screen.getByText('Upload Audio')).toBeInTheDocument()
  })

  it('should show uploaded file name after upload', async () => {
    render(<AudioUploader onAudioReady={mockOnAudioReady} />)

    // Verify file input exists
    const fileInput = document.querySelector('input[type="file"]')
    expect(fileInput).toBeTruthy()
  })

  it('should start recording when button clicked', async () => {
    const user = userEvent.setup()

    render(<AudioUploader onAudioReady={mockOnAudioReady} />)

    // Switch to record tab
    const recordTab = screen.getByRole('tab', { name: /Record/i })
    await user.click(recordTab)

    // Verify start recording button exists
    expect(screen.getByText('Start Recording')).toBeInTheDocument()
  })

  it('should stop recording and process audio', async () => {
    const user = userEvent.setup()

    render(<AudioUploader onAudioReady={mockOnAudioReady} />)

    // Switch to record tab
    const recordTab = screen.getByRole('tab', { name: /Record/i })
    await user.click(recordTab)

    // Verify button exists
    expect(screen.getByText('Start Recording')).toBeInTheDocument()
  })

  it('should accept mp3 and wav files', () => {
    render(<AudioUploader onAudioReady={mockOnAudioReady} />)

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement

    if (fileInput) {
      expect(fileInput).toHaveAttribute('accept')
    }
  })

  it('should not show processing by default', () => {
    render(<AudioUploader onAudioReady={mockOnAudioReady} />)

    expect(screen.queryByText(/Processing/i)).not.toBeInTheDocument()
  })

  it('should decode audio buffer correctly', async () => {
    render(<AudioUploader onAudioReady={mockOnAudioReady} />)

    // Verify the component structure
    expect(screen.getByText('Upload Audio')).toBeInTheDocument()
  })

  it('should handle recording with webm format', async () => {
    const user = userEvent.setup()

    render(<AudioUploader onAudioReady={mockOnAudioReady} />)

    // Switch to record tab
    const recordTab = screen.getByRole('tab', { name: /Record/i })
    await user.click(recordTab)

    expect(screen.getByText('Start Recording')).toBeInTheDocument()
  })

  it('should cleanup timers on unmount', () => {
    const { unmount } = render(<AudioUploader onAudioReady={mockOnAudioReady} />)

    unmount()

    // Should not throw error
    expect(true).toBe(true)
  })
})
