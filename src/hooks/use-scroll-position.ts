import { useEffect, useState } from 'react'

/**
 * Hook to track the current vertical scroll position
 *
 * Listens to scroll events and updates state with the current Y offset.
 * Useful for showing/hiding elements based on scroll position or
 * implementing scroll-based animations.
 *
 * @returns Current Y scroll position in pixels
 *
 * @example
 * ```tsx
 * function FloatingButton() {
 *   const scrollY = useScrollPosition()
 *
 *   // Only show button after scrolling down 300px
 *   if (scrollY < 300) return null
 *
 *   return <button>Back to Top</button>
 * }
 * ```
 */
export function useScrollPosition(): number {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    // Handler to update scroll position
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    // Set initial scroll position
    handleScroll()

    // Listen to scroll events
    // Using passive: true improves scrolling performance
    window.addEventListener('scroll', handleScroll, { passive: true })

    // Cleanup: remove listener when component unmounts
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return scrollY
}
