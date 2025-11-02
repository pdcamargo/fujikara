'use client'

import * as React from 'react'
import { useNavigate } from '@tanstack/react-router'
import { allMdxes } from 'content-collections'
import { File, Search } from 'lucide-react'

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'

// Context to share the open state
const CommandPaletteContext = React.createContext<{
  setOpen: (open: boolean) => void
} | null>(null)

export function useCommandPalette() {
  const context = React.useContext(CommandPaletteContext)
  if (!context) {
    throw new Error('useCommandPalette must be used within DocumentCommandPalette')
  }
  return context
}

// Category label mapping (same as index page)
const CATEGORY_LABELS: Record<string, string> = {
  vilas: 'Vilas',
  organizacoes: 'Organizações',
  personagens: 'Personagens',
  localizacoes: 'Localizações',
}

// Type for document with slug
type DocWithSlug = (typeof allMdxes)[number] & { slug: string }

// Generate slug from path (same logic as index page)
const generateSlug = (path: string): string => {
  return path
    .split(' ')
    .map((p) => p.toLowerCase())
    .join('-')
}

// Group documents by their full category path (parent folder)
const groupDocumentsByCategory = (
  documents: Array<DocWithSlug>,
): Record<string, Array<DocWithSlug>> => {
  const groups: Record<string, Array<DocWithSlug>> = {}

  for (const doc of documents) {
    const pathParts = doc._meta.path.split('/')

    // If document is at root (no parent folder), use "Outros"
    let categoryPath: string
    if (pathParts.length === 1) {
      categoryPath = 'Outros'
    } else {
      // Get all path parts except the filename (last part)
      categoryPath = pathParts.slice(0, -1).join(' / ')
    }

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!groups[categoryPath]) {
      groups[categoryPath] = []
    }
    groups[categoryPath].push(doc)
  }

  return groups
}

// Get display label for a category path part
const getPathPartLabel = (part: string): string => {
  return CATEGORY_LABELS[part.toLowerCase()] || part
}

// Format category path with proper labels
const formatCategoryPath = (categoryPath: string): string => {
  if (categoryPath === 'Outros') return categoryPath

  return categoryPath.split(' / ').map(getPathPartLabel).join(' / ')
}

// Sort categories: vilas first, then alphabetically, "Outros" last
const sortCategories = (categories: Array<string>): Array<string> => {
  return categories.sort((a, b) => {
    // "Outros" always goes last
    if (a === 'Outros') return 1
    if (b === 'Outros') return -1

    // Extract first part for vilas priority
    const aFirst = a.split(' / ')[0].toLowerCase()
    const bFirst = b.split(' / ')[0].toLowerCase()

    if (aFirst === 'vilas' && bFirst !== 'vilas') return -1
    if (bFirst === 'vilas' && aFirst !== 'vilas') return 1

    return a.localeCompare(b)
  })
}

export function DocumentCommandPalette({ children }: { children?: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)
  const navigate = useNavigate()

  // Process all documents with slugs
  const documents: Array<DocWithSlug> = React.useMemo(
    () =>
      allMdxes.map((doc) => ({
        ...doc,
        slug: generateSlug(doc._meta.path),
      })),
    [],
  )

  // Group documents by category
  const documentsByCategory = React.useMemo(
    () => groupDocumentsByCategory(documents),
    [documents],
  )

  const sortedCategories = React.useMemo(
    () => sortCategories(Object.keys(documentsByCategory)),
    [documentsByCategory],
  )

  // Keyboard shortcut listener
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((prevOpen) => !prevOpen)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  // Handle document selection
  const handleSelect = (slug: string) => {
    setOpen(false)
    navigate({ to: `/${slug}` as any })
  }

  return (
    <CommandPaletteContext.Provider value={{ setOpen }}>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Digite o nome de um personagem, documento, localização, etc" />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {sortedCategories.map((categoryPath) => (
            <CommandGroup
              key={categoryPath}
              heading={formatCategoryPath(categoryPath)}
            >
              {documentsByCategory[categoryPath].map((doc) => (
                <CommandItem
                  key={doc._meta.path}
                  value={`${doc.title} ${doc.tags.join(' ')}`}
                  onSelect={() => handleSelect(doc.slug)}
                  className="flex items-center gap-2"
                >
                  <File className="shrink-0" />
                  <span className="truncate">{doc.title}</span>
                  {doc.tags.length > 0 && (
                    <span className="ml-auto text-xs text-muted-foreground shrink-0 truncate max-w-[200px]">
                      {doc.tags.join(', ')}
                    </span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
      {children}
    </CommandPaletteContext.Provider>
  )
}

// Floating button to trigger the command palette
export function CommandPaletteTrigger() {
  const { setOpen } = useCommandPalette()

  return (
    <button
      onClick={() => setOpen(true)}
      className="fixed top-4 right-4 z-40 h-10 w-10 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors flex items-center justify-center"
      aria-label="Open search"
    >
      <Search className="h-5 w-5" />
    </button>
  )
}
