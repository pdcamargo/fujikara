import { Link } from '@tanstack/react-router'
import { Card, CardHeader, CardTitle } from './ui/card'

interface RelatedDocument {
  title: string
  path: string
}

interface RelatedDocumentsProps {
  relatedJson: string
}

export function RelatedDocuments({ relatedJson }: RelatedDocumentsProps) {
  // Parse the related documents JSON
  const relatedDocs: RelatedDocument[] = JSON.parse(relatedJson || '[]')

  // Don't render anything if there are no related documents
  if (!relatedDocs || relatedDocs.length === 0) {
    return null
  }

  return (
    <section className="mt-12 pt-8 border-t border-border">
      <h2 className="text-2xl font-semibold text-foreground mb-6">
        Documentos Relacionados
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {relatedDocs.map((doc) => (
          <Link
            key={doc.path}
            to={doc.path as any}
            className="group"
          >
            <Card className="h-full transition-all duration-200 hover:shadow-lg hover:border-primary/50 dark:hover:border-primary/30 bg-card dark:bg-card">
              <CardHeader>
                <CardTitle className="text-base group-hover:text-primary transition-colors">
                  {doc.title}
                </CardTitle>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  )
}
