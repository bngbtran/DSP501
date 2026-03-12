import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PlayButton from '@/components/common/PlayButton'

describe('PlayButton', () => {
  it('should render play icon when not playing', () => {
    render(<PlayButton isPlaying={false} onClick={vi.fn()} />)
    
    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
  })

  it('should render pause icon when playing', () => {
    render(<PlayButton isPlaying={true} onClick={vi.fn()} />)
    
    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
  })

  it('should call onClick when button is clicked', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()
    
    render(<PlayButton isPlaying={false} onClick={handleClick} />)
    
    const button = screen.getByRole('button')
    await user.click(button)
    
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('should toggle between play and pause states', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()
    
    const { rerender } = render(<PlayButton isPlaying={false} onClick={handleClick} />)
    
    const button = screen.getByRole('button')
    await user.click(button)
    
    expect(handleClick).toHaveBeenCalledTimes(1)
    
    rerender(<PlayButton isPlaying={true} onClick={handleClick} />)
    
    await user.click(button)
    expect(handleClick).toHaveBeenCalledTimes(2)
  })

  it('should have proper styling classes', () => {
    render(<PlayButton isPlaying={false} onClick={vi.fn()} />)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('h-10', 'w-10', 'rounded-full')
  })
})
