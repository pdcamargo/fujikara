import { defineCollection, defineConfig } from '@content-collections/core'
import { compileMDX } from '@content-collections/mdx'

import { z } from 'zod'

import {
  extractSectionData,
  extractTag,
  findRelatedDocuments,
  generateTableOfContents,
  removeTag,
  transformAutolinks,
  transformCustomSyntax,
  transformKeyValuePairs,
} from './src/lib/mdx-transformers'
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
    // Get all documents for autolink generation (include both mdx and characters)
    const allMdxDocs: Array<DocumentReference> = context.documents(mdx).map((doc) => ({
      title: doc.title,
      _meta: doc._meta,
    }))
    const allCharacterDocs: Array<DocumentReference> = context.documents(characters).map((doc) => ({
      title: doc.title,
      _meta: doc._meta,
    }))
    const allDocuments = [...allMdxDocs, ...allCharacterDocs]

    // Apply transformations in order:
    // 1. Transform key::: value pairs into structured HTML
    const transformedContent = transformKeyValuePairs(document.content)

    // 2. Extract sidepanel content before transformation
    const sidepanelTags = extractTag(transformedContent, 'sidepanel')

    // 3. Remove sidepanel from main content
    let mainContent = removeTag(transformedContent, 'sidepanel')

    // 4. Apply autolinks to main content (before custom syntax transformation)
    mainContent = transformAutolinks(mainContent, document._meta.path, allDocuments)

    // 5. Generate table of contents HTML from cleaned content (before custom syntax transformation)
    const tableOfContentsHtml = generateTableOfContents(mainContent)

    // 5.1. Extract section data for navigation (before custom syntax transformation)
    const sectionsData = extractSectionData(mainContent)
    // Serialize sections as JSON string to ensure it's serializable
    const sections = JSON.stringify(sectionsData)

    // 5.2. Find related documents based on content
    const relatedDocuments = findRelatedDocuments(transformedContent, document._meta.path, allDocuments)
    const related = JSON.stringify(relatedDocuments)

    // 6. Transform custom bracket syntax [tag]...[/tag] on main content
    mainContent = transformCustomSyntax(mainContent)

    // 7. Compile the main MDX content
    const body = await compileMDX(context, {
      ...document,
      content: mainContent,
    })

    // 8. Compile table of contents as MDX
    const tableOfContents = await compileMDX(context, {
      ...document,
      content: tableOfContentsHtml,
    })

    // 9. Process sidepanel if it exists
    let sidePanel: Awaited<ReturnType<typeof compileMDX>> | undefined =
      undefined

    if (sidepanelTags.length > 0) {
      // Combine all sidepanel instances into one string
      let combinedSidePanel = sidepanelTags.join('\n\n')

      // Apply autolinks to sidepanel content
      combinedSidePanel = transformAutolinks(combinedSidePanel, document._meta.path, allDocuments)

      // Transform the sidepanel content (key-value pairs already done, now custom syntax)
      const transformedSidePanel = transformCustomSyntax(combinedSidePanel)

      // Compile the sidepanel content separately
      sidePanel = await compileMDX(context, {
        ...document,
        content: transformedSidePanel,
      })
    }

    return {
      ...document,
      body,
      sidePanel,
      tableOfContents,
      sections,
      related,
    }
  },
})

const characters = defineCollection({
  name: 'characters',
  directory,
  include: ['**/personagens/**/*.mdx', '**/personagens/**/*.md'],
  schema: z.object({
    title: z.string(),
    tags: z
      .string()
      .transform((tags) => tags.split(',').map((tag) => tag.trim())),
  }),
  transform: async (document, context) => {
    // Get all documents for autolink generation (include both mdx and characters)
    const allMdxDocs: Array<DocumentReference> = context.documents(mdx).map((doc) => ({
      title: doc.title,
      _meta: doc._meta,
    }))
    const allCharacterDocs: Array<DocumentReference> = context.documents(characters).map((doc) => ({
      title: doc.title,
      _meta: doc._meta,
    }))
    const allDocuments = [...allMdxDocs, ...allCharacterDocs]

    // Apply transformations in order:
    // 1. Transform key::: value pairs into structured HTML
    const transformedContent = transformKeyValuePairs(document.content)

    // 2. Extract sidepanel content before transformation
    const sidepanelTags = extractTag(transformedContent, 'sidepanel')

    // 3. Remove sidepanel from main content
    let mainContent = removeTag(transformedContent, 'sidepanel')

    // 4. Apply autolinks to main content (before custom syntax transformation)
    mainContent = transformAutolinks(mainContent, document._meta.path, allDocuments)

    // 5. Generate table of contents HTML from cleaned content (before custom syntax transformation)
    const tableOfContentsHtml = generateTableOfContents(mainContent)

    // 5.1. Extract section data for navigation (before custom syntax transformation)
    const sectionsData = extractSectionData(mainContent)
    // Serialize sections as JSON string to ensure it's serializable
    const sections = JSON.stringify(sectionsData)

    // 5.2. Find related documents based on content
    const relatedDocuments = findRelatedDocuments(transformedContent, document._meta.path, allDocuments)
    const related = JSON.stringify(relatedDocuments)

    // 6. Transform custom bracket syntax [tag]...[/tag] on main content
    mainContent = transformCustomSyntax(mainContent)

    // 7. Compile the main MDX content
    const body = await compileMDX(context, {
      ...document,
      content: mainContent,
    })

    // 8. Compile table of contents as MDX
    const tableOfContents = await compileMDX(context, {
      ...document,
      content: tableOfContentsHtml,
    })

    // 9. Process sidepanel if it exists
    let sidePanel: Awaited<ReturnType<typeof compileMDX>> | undefined =
      undefined

    if (sidepanelTags.length > 0) {
      // Combine all sidepanel instances into one string
      let combinedSidePanel = sidepanelTags.join('\n\n')

      // Apply autolinks to sidepanel content
      combinedSidePanel = transformAutolinks(combinedSidePanel, document._meta.path, allDocuments)

      // Transform the sidepanel content (key-value pairs already done, now custom syntax)
      const transformedSidePanel = transformCustomSyntax(combinedSidePanel)

      // Compile the sidepanel content separately
      sidePanel = await compileMDX(context, {
        ...document,
        content: transformedSidePanel,
      })
    }

    return {
      ...document,
      body,
      sidePanel,
      tableOfContents,
      sections,
      related,
    }
  },
})

export default defineConfig({
  collections: [mdx, characters],
})
