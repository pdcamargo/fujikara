import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface SectionData {
  id: string;
  title: string;
  level: number;
  numbering: string;
}

interface ReadingProgressBarProps {
  sectionsJson: string;
  className?: string;
}

export function ReadingProgressBar({
  sectionsJson,
  className,
}: ReadingProgressBarProps) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [sectionPositions, setSectionPositions] = useState<number[]>([]);

  const sections: SectionData[] = sectionsJson
    ? JSON.parse(sectionsJson)
    : [];

  // Calculate section positions as percentages
  useEffect(() => {
    let debounceTimeout: ReturnType<typeof setTimeout> | null = null;

    const calculateSectionPositions = () => {
      const documentHeight =
        document.documentElement.scrollHeight - window.innerHeight;

      if (documentHeight <= 0) {
        setSectionPositions([]);
        return;
      }

      const positions = sections
        .map((section) => {
          const element = document.getElementById(section.id);
          if (!element) return null;

          const elementTop = element.getBoundingClientRect().top + window.scrollY;
          const percentage = (elementTop / documentHeight) * 100;
          return Math.min(Math.max(percentage, 0), 100);
        })
        .filter((pos): pos is number => pos !== null);

      setSectionPositions(positions);
    };

    const debouncedCalculate = () => {
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }
      debounceTimeout = setTimeout(calculateSectionPositions, 50);
    };

    // Calculate on mount and when sections change
    calculateSectionPositions();

    // Recalculate on window resize
    window.addEventListener("resize", debouncedCalculate);

    // Give content time to render, then recalculate
    const initialTimeout = setTimeout(calculateSectionPositions, 100);

    // Watch for DOM mutations (TOC opening/closing, content changes)
    const observer = new MutationObserver(debouncedCalculate);

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style'],
    });

    return () => {
      window.removeEventListener("resize", debouncedCalculate);
      clearTimeout(initialTimeout);
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }
      observer.disconnect();
    };
  }, [sectionsJson]);

  // Track scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const documentHeight =
        document.documentElement.scrollHeight - window.innerHeight;

      if (documentHeight <= 0) {
        setScrollProgress(0);
        return;
      }

      const progress = (scrollTop / documentHeight) * 100;
      setScrollProgress(Math.min(Math.max(progress, 0), 100));
    };

    handleScroll(); // Initial calculation
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div
      className={cn(
        "fixed left-0 right-0 top-0 z-50 h-[5px] bg-muted",
        className
      )}
      role="progressbar"
      aria-valuenow={Math.round(scrollProgress)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Reading progress"
    >
      {/* Progress fill */}
      <div
        className="h-full bg-primary transition-all duration-150 ease-out"
        style={{ width: `${scrollProgress}%` }}
      />

      {/* Section dividers */}
      {sectionPositions.map((position, index) => (
        <div
          key={`${sections[index]?.id}-${position}`}
          className="absolute top-0 bottom-0 w-[2px] bg-border opacity-60"
          style={{ left: `${position}%` }}
          title={sections[index]?.title}
        />
      ))}
    </div>
  );
}
