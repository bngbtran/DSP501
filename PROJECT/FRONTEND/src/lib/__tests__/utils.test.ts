import { describe, it, expect } from 'vitest'
import { cn } from '@/lib/utils'

describe('utils', () => {
  describe('cn', () => {
    it('should merge class names correctly', () => {
      const result = cn('class1', 'class2')
      expect(result).toBe('class1 class2')
    })

    it('should handle conditional classes', () => {
      const result = cn('base', true && 'truthy', false && 'falsy')
      expect(result).toBe('base truthy')
    })

    it('should merge tailwind classes without conflicts', () => {
      const result = cn('p-4 text-red-500', 'p-8 text-blue-500')
      expect(result).toBe('p-8 text-blue-500')
    })

    it('should handle arrays', () => {
      const result = cn(['class1', 'class2'], 'class3')
      expect(result).toBe('class1 class2 class3')
    })

    it('should handle objects', () => {
      const result = cn({ class1: true, class2: false, class3: true })
      expect(result).toBe('class1 class3')
    })

    it('should handle undefined and null', () => {
      const result = cn('class1', undefined, null, 'class2')
      expect(result).toBe('class1 class2')
    })

    it('should handle empty input', () => {
      const result = cn()
      expect(result).toBe('')
    })
  })
})
