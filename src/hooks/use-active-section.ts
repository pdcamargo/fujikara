import { useEffect, useState } from 'react'

/**
 * Hook to track the currently active section based on scroll position
 *
 * Uses IntersectionObserver to detect which heading is currently visible
 * in the viewport. Updates automatically when user scrolls, including
 * manual scroll detection.
 *
 * @param sectionIds - Array of section IDs to track (e.g., ['intro', 'features', 'usage'])
 * @returns The ID of the currently active section, or empty string if none
 *
 * @example
 * ```tsx
 * const sections = ['introduction', 'getting-started', 'usage']
 * const activeSection = useActiveSection(sections)
 *
 * // activeSection will be 'getting-started' when that section is in view
 * ```
 */
export function useActiveSection(sectionIds: Array<string>): string {
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    if (sectionIds.length === 0) return

    // Store all observers so we can clean them up
    const observers: Array<IntersectionObserver> = []

    // Track which sections are currently intersecting
    const intersectingIds = new Set<string>()

    // Create an observer for each section
    sectionIds.forEach((id) => {
      const element = document.getElementById(id)
      if (!element) return

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const targetId = entry.target.id

            if (entry.isIntersecting) {
              // Section is visible
              intersectingIds.add(targetId)
            } else {
              // Section is not visible
              intersectingIds.delete(targetId)
            }

            // Find the first intersecting section in the sectionIds order
            // This ensures we always pick the topmost visible section
            const firstIntersecting = sectionIds.find((id) =>
              intersectingIds.has(id),
            )

            if (firstIntersecting) {
              setActiveId(firstIntersecting)
            }
          })
        },
        {
          // Root margin creates a "zone" where sections are considered active
          // Top margin: 80px below top of viewport (accounts for fixed headers)
          // Bottom margin: 80% of viewport height (so section activates when near top)
          rootMargin: '-80px 0px -80% 0px',
          threshold: 0,
        },
      )

      observer.observe(element)
      observers.push(observer)
    })

    // Cleanup: disconnect all observers when component unmounts or deps change
    return () => {
      observers.forEach((observer) => observer.disconnect())
    }
  }, [sectionIds])

  return activeId
}
