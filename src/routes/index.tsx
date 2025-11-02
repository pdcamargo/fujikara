import { Link, createFileRoute } from '@tanstack/react-router'
import { allMdxes } from 'content-collections'
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  File,
  FileText,
  Folder,
} from 'lucide-react'
import { useState } from 'react'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'

// Category label mapping for display names
const CATEGORY_LABELS: Record<string, string> = {
  vilas: 'Vilas',
  organizacoes: 'Organizações',
  personagens: 'Personagens',
  localizacoes: 'Localizações',
}

// Helper to get display label for a category
const getCategoryLabel = (category: string): string => {
  return CATEGORY_LABELS[category.toLowerCase()] || category
}

// Type for hierarchical document structure
type DocWithSlug = (typeof allMdxes)[number] & { slug: string }
type NestedCategory = {
  docs: Array<DocWithSlug>
  subcategories: Record<string, NestedCategory>
}

// Build hierarchical category structure from flat document list
const buildHierarchy = (
  documents: Array<DocWithSlug>,
): Record<string, NestedCategory> => {
  const hierarchy: Record<string, NestedCategory> = {}

  for (const doc of documents) {
    const pathParts = doc._meta.path.split('/')

    // Ensure root category exists
    const rootCategory = pathParts[0]
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!hierarchy[rootCategory]) {
      hierarchy[rootCategory] = { docs: [], subcategories: {} }
    }

    // Navigate through path and create nested structure
    let currentLevel = hierarchy[rootCategory].subcategories

    for (let i = 1; i < pathParts.length - 1; i++) {
      const part = pathParts[i]
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (!currentLevel[part]) {
        currentLevel[part] = { docs: [], subcategories: {} }
      }
      currentLevel = currentLevel[part].subcategories
    }

    // Add document to the appropriate category
    if (pathParts.length === 1) {
      // Root level document
      hierarchy[rootCategory].docs.push(doc)
    } else {
      // Document in a subcategory - add to the parent folder
      const parentCategory = pathParts[pathParts.length - 2]
      let targetCategory = hierarchy[rootCategory].subcategories

      // Navigate to the parent category
      for (let i = 1; i < pathParts.length - 2; i++) {
        targetCategory = targetCategory[pathParts[i]].subcategories
      }

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (!targetCategory[parentCategory]) {
        targetCategory[parentCategory] = { docs: [], subcategories: {} }
      }
      targetCategory[parentCategory].docs.push(doc)
    }
  }

  return hierarchy
}

// Sort categories: vilas first, then alphabetically
const sortCategories = (categories: Array<string>): Array<string> => {
  return categories.sort((a, b) => {
    if (a === 'vilas') return -1
    if (b === 'vilas') return 1
    return a.localeCompare(b)
  })
}

export const Route = createFileRoute('/')({
  component: WikiIndex,
  beforeLoad() {
    // Process and group all MDX documents
    const documents = allMdxes.map((doc) => ({
      ...doc,
      slug: doc._meta.path
        .split(' ')
        .map((p: string) => p.toLowerCase())
        .join('-'),
    }))

    return { documents }
  },
})

// Component to render a single document item
function DocumentItem({ doc, level }: { doc: DocWithSlug; level: number }) {
  return (
    <Link
      to={`/${doc.slug}` as any}
      className="flex items-center gap-3 py-2 px-3 rounded-md hover:bg-accent/50 transition-colors group"
      style={{ paddingLeft: `${level * 1.5 + 0.75}rem` }}
    >
      <File className="w-4 h-4 text-muted-foreground shrink-0" />
      <span className="text-foreground group-hover:text-primary transition-colors">
        {doc.title}
      </span>
      {doc.tags.length > 0 && (
        <span className="text-xs text-muted-foreground ml-auto">
          {doc.tags.join(', ')}
        </span>
      )}
    </Link>
  )
}

// Recursive component to render category tree
function CategoryTree({
  categoryName,
  category,
  level = 0,
}: {
  categoryName: string
  category: NestedCategory
  level?: number
}) {
  const [isOpen, setIsOpen] = useState(true)
  const hasDocuments = category.docs.length > 0
  const hasSubcategories = Object.keys(category.subcategories).length > 0

  if (!hasDocuments && !hasSubcategories) return null

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mb-2">
      {/* Category header - collapsible trigger */}
      <CollapsibleTrigger asChild>
        <div
          className="flex items-center gap-2 py-2 px-3 font-semibold text-foreground cursor-pointer hover:bg-accent/30 rounded-md transition-colors"
          style={{ paddingLeft: `${level * 1.5 + 0.75}rem` }}
        >
          {isOpen ? (
            <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
          ) : (
            <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
          )}
          <Folder className="w-4 h-4 text-primary shrink-0" />
          <span>{getCategoryLabel(categoryName)}</span>
        </div>
      </CollapsibleTrigger>

      <CollapsibleContent>
        {/* Documents in this category */}
        {hasDocuments && (
          <div className="space-y-0.5">
            {category.docs.map((doc) => (
              <DocumentItem key={doc._meta.path} doc={doc} level={level + 1} />
            ))}
          </div>
        )}

        {/* Subcategories */}
        {hasSubcategories && (
          <div className="mt-1">
            {sortCategories(Object.keys(category.subcategories)).map(
              (subCategoryName) => (
                <CategoryTree
                  key={subCategoryName}
                  categoryName={subCategoryName}
                  category={category.subcategories[subCategoryName]}
                  level={level + 1}
                />
              ),
            )}
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  )
}

function WikiIndex() {
  const { documents } = Route.useRouteContext()

  // Build hierarchical structure
  const hierarchy = buildHierarchy(documents)
  const sortedRootCategories = sortCategories(Object.keys(hierarchy))

  // Count total categories (including nested)
  const countCategories = (cat: NestedCategory): number => {
    return (
      1 +
      Object.values(cat.subcategories).reduce(
        (sum, subcat) => sum + countCategories(subcat),
        0,
      )
    )
  }
  const totalCategories = Object.values(hierarchy).reduce(
    (sum, cat) => sum + countCategories(cat),
    0,
  )

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <section className="bg-card border-b border-border py-12 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center gap-4 mb-4">
            <BookOpen className="w-12 h-12 text-primary" />
            <h1 className="text-5xl font-bold text-foreground">Fujikara</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl">
            Encontre todos os personagens, localizações e documentos de suporte
            relacionados a Fujikara.
          </p>
          <div className="mt-6 flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span>{documents.length} documentos</span>
            </div>
            <div className="flex items-center gap-2">
              <span>•</span>
              <span>{totalCategories} categorias</span>
            </div>
          </div>
        </div>
      </section>

      {/* Content sections */}
      <div className="container mx-auto max-w-7xl px-6 py-12">
        <div className="bg-card border border-border rounded-lg p-6">
          {sortedRootCategories.map((categoryName) => (
            <CategoryTree
              key={categoryName}
              categoryName={categoryName}
              category={hierarchy[categoryName]}
              level={0}
            />
          ))}
        </div>

        {documents.length === 0 && (
          <div className="text-center py-20">
            <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-foreground mb-2">
              No documents found
            </h3>
            <p className="text-muted-foreground">
              Add some .md or .mdx files to the /mdx directory to get started.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
