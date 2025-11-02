import { ArrowDown, ArrowUp, ChevronUp } from 'lucide-react'
import { useEffect, useState } from 'react'

import type { SectionData } from '@/lib/mdx-transformers'

import { useActiveSection } from '@/hooks/use-active-section'
import { useIsMobile } from '@/hooks/use-mobile'
import { useScrollPosition } from '@/hooks/use-scroll-position'
import { cn } from '@/lib/utils'

import { Button } from './ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip'

interface FloatingNavigationProps {
  /**
   * JSON string containing section data from content-collections
   * Must be parsed before use
   */
  sectionsJson: string
}

/**
 * Floating action bar for document navigation
 *
 * Provides three navigation actions:
 * - Back to Top: Scrolls to the top of the page
 * - Previous Section: Navigates to the previous heading
 * - Next Section: Navigates to the next heading
 *
 * Features:
 * - Automatically tracks current section based on scroll position
 * - Disables prev/next buttons at document boundaries
 * - Only appears after scrolling down 300px
 * - Hides on mobile devices
 * - Smooth scroll behavior
 *
 * @example
 * ```tsx
 * <FloatingNavigation sectionsJson={mdx.sections} />
 * ```
 */
export function FloatingNavigation({ sectionsJson }: FloatingNavigationProps) {
  const scrollY = useScrollPosition()
  const isMobile = useIsMobile()
  const [sections, setSections] = useState<Array<SectionData>>([])

  // Parse sections JSON on mount
  useEffect(() => {
    try {
      const parsed = JSON.parse(sectionsJson) as Array<SectionData>
      setSections(parsed)
    } catch (error) {
      console.error('Failed to parse sections JSON:', error)
      setSections([])
    }
  }, [sectionsJson])

  // Get section IDs for tracking
  const sectionIds = sections.map((s) => s.id)
  const activeSection = useActiveSection(sectionIds)

  // Find current section index
  const currentIndex = sections.findIndex((s) => s.id === activeSection)

  // Check if we can navigate prev/next
  const canGoPrev = currentIndex > 0
  const canGoNext = currentIndex < sections.length - 1

  // Only show after scrolling down 300px
  const isVisible = scrollY > 300

  // Hide on mobile
  if (isMobile || !isVisible || sections.length === 0) {
    return null
  }

  /**
   * Scrolls to a section by ID with smooth behavior
   */
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (!element) return

    // Scroll with offset to account for fixed headers
    const offset = 100
    const elementPosition = element.getBoundingClientRect().top
    const offsetPosition = elementPosition + window.scrollY - offset

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth',
    })
  }

  /**
   * Scrolls to the top of the page
   */
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  /**
   * Navigates to the previous section
   */
  const goToPrevSection = () => {
    if (!canGoPrev) return
    const prevSection = sections[currentIndex - 1]
    scrollToSection(prevSection.id)
  }

  /**
   * Navigates to the next section
   */
  const goToNextSection = () => {
    if (!canGoNext) return
    const nextSection = sections[currentIndex + 1]
    scrollToSection(nextSection.id)
  }

  return (
    <TooltipProvider>
      <div
        className={cn(
          'fixed bottom-6 right-6 z-50',
          'flex flex-col gap-2',
          'transition-all duration-300',
          'animate-in fade-in slide-in-from-bottom-4',
        )}
      >
        {/* Previous Section Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={goToPrevSection}
              disabled={!canGoPrev}
              className={cn(
                'shadow-lg backdrop-blur-sm',
                'bg-background/80 hover:bg-background',
                'border-border/50',
              )}
              aria-label="Previous section"
            >
              <ArrowUp className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            {canGoPrev && sections[currentIndex - 1] ? (
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">Previous</span>
                <span className="font-medium">
                  {sections[currentIndex - 1].numbering}{' '}
                  {sections[currentIndex - 1].title}
                </span>
              </div>
            ) : (
              <span>No previous section</span>
            )}
          </TooltipContent>
        </Tooltip>

        {/* Back to Top Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="default"
              size="icon"
              onClick={scrollToTop}
              className={cn('shadow-lg backdrop-blur-sm')}
              aria-label="Back to top"
            >
              <ChevronUp className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <span>Back to top</span>
          </TooltipContent>
        </Tooltip>

        {/* Next Section Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={goToNextSection}
              disabled={!canGoNext}
              className={cn(
                'shadow-lg backdrop-blur-sm',
                'bg-background/80 hover:bg-background',
                'border-border/50',
              )}
              aria-label="Next section"
            >
              <ArrowDown className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            {canGoNext && sections[currentIndex + 1] ? (
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">Next</span>
                <span className="font-medium">
                  {sections[currentIndex + 1].numbering}{' '}
                  {sections[currentIndex + 1].title}
                </span>
              </div>
            ) : (
              <span>No next section</span>
            )}
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  )
}
