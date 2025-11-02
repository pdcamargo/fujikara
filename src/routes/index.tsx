import { Link, createFileRoute } from '@tanstack/react-router'
import { allMdxes } from 'content-collections'
import { BookOpen, FileText } from 'lucide-react'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const Route = createFileRoute('/')({
  component: WikiIndex,
  beforeLoad() {
    // Process and group all MDX documents
    const documents = allMdxes.map((doc) => ({
      ...doc,
      slug: doc._meta.path
        .split(' ')
        .map((p) => p.toLowerCase())
        .join('-'),
    }))

    return { documents }
  },
})

function WikiIndex() {
  const { documents } = Route.useRouteContext()

  // Group documents by category/directory
  const groupedDocs = documents.reduce(
    (acc, doc) => {
      const pathParts = doc._meta.path.split('/')
      const category = pathParts[0] || 'Uncategorized'
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (!acc[category]) acc[category] = []
      acc[category].push(doc)
      return acc
    },
    {} as Record<string, typeof documents>,
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
              <span>{Object.keys(groupedDocs).length} categorias</span>
            </div>
          </div>
        </div>
      </section>

      {/* Content sections */}
      <div className="container mx-auto max-w-7xl px-6 py-12">
        {Object.entries(groupedDocs).map(([category, docs]) => (
          <section key={category} className="mb-16 last:mb-0">
            <h2 className="text-3xl font-semibold text-foreground mb-6 capitalize border-b border-border pb-3">
              {category}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {docs.map((doc) => (
                <Link
                  key={doc._meta.path}
                  to={`/${doc.slug}` as any}
                  className="group"
                >
                  <Card className="h-full transition-all duration-200 hover:shadow-lg hover:border-primary/50 dark:hover:border-primary/30 bg-card dark:bg-card">
                    <CardHeader>
                      <CardTitle className="group-hover:text-primary transition-colors">
                        {doc.title}
                      </CardTitle>
                      <CardDescription>
                        {doc.tags.length > 0 && (
                          <div className="flex gap-2 flex-wrap mt-3">
                            {doc.tags.map((tag) => (
                              <Badge
                                key={tag}
                                variant="secondary"
                                className="text-xs"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        ))}

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
