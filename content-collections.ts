import { defineCollection, defineConfig } from '@content-collections/core'

import { z } from 'zod'

import { MdTransformer } from './src/lib/md-transformer'
import type { DocumentReference } from './src/lib/mdx-transformers'

// Always use ./mdx in Docker/production builds
// Run pnpm copy:content before building to populate ./mdx
const directory = './mdx'

const mdx = defineCollection({
  name: 'mdx',
  directory,
  include: ['**/*.mdx', '**/*.md'],
  schema: z.object({
    title: z.string(),
    tags: z
      .string()
      .transform((tags) => tags.split(',').map((tag) => tag.trim())),
  }),
  transform: async (document, context) => {
    // Get all documents for autolink generation
    const allDocuments: Array<DocumentReference> = context
      .documents(mdx)
      .map((doc) => ({
        title: doc.title,
        _meta: doc._meta,
      }))

    // Use the new MdTransformer class for clean, chainable API
    const result = await new MdTransformer(document, context)
      .transformKeyValuePairs()
      .extractTag('sidepanel')
      .removeTag('sidepanel', 'secret')
      .generateTableOfContents()
      .transformAutolinks(allDocuments)
      .extractSectionData()
      .findRelatedDocuments(allDocuments)
      .transformCustomSyntax()
      .applyAutolinksToTag('sidepanel', allDocuments)
      .getResult()

    return result
  },
})

export default defineConfig({
  collections: [mdx],
})
