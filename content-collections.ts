import { defineCollection, defineConfig } from '@content-collections/core'
import { compileMDX } from '@content-collections/mdx'

import { z } from 'zod'

import {
  extractSectionData,
  extractTag,
  generateTableOfContents,
  removeTag,
  transformCustomSyntax,
  transformKeyValuePairs,
} from './src/lib/mdx-transformers'

const isProduction = process.env.NODE_ENV === 'production'

const directory = isProduction ? '../../writing/fujikara' : './mdx'

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
    // Apply transformations in order:
    // 1. Transform key::: value pairs into structured HTML
    const transformedContent = transformKeyValuePairs(document.content)

    // 2. Extract sidepanel content before transformation
    const sidepanelTags = extractTag(transformedContent, 'sidepanel')

    // 3. Remove sidepanel from main content
    let mainContent = removeTag(transformedContent, 'sidepanel')

    // 4. Generate table of contents HTML from cleaned content (before custom syntax transformation)
    const tableOfContentsHtml = generateTableOfContents(mainContent)

    // 4.1. Extract section data for navigation (before custom syntax transformation)
    const sectionsData = extractSectionData(mainContent)
    // Serialize sections as JSON string to ensure it's serializable
    const sections = JSON.stringify(sectionsData)

    // 5. Transform custom bracket syntax [tag]...[/tag] on main content
    mainContent = transformCustomSyntax(mainContent)

    // 6. Compile the main MDX content
    const body = await compileMDX(context, {
      ...document,
      content: mainContent,
    })

    // 7. Compile table of contents as MDX
    const tableOfContents = await compileMDX(context, {
      ...document,
      content: tableOfContentsHtml,
    })

    // 8. Process sidepanel if it exists
    let sidePanel: Awaited<ReturnType<typeof compileMDX>> | undefined =
      undefined

    if (sidepanelTags.length > 0) {
      // Combine all sidepanel instances into one string
      const combinedSidePanel = sidepanelTags.join('\n\n')

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
    }
  },
})

export default defineConfig({
  collections: [mdx],
})
