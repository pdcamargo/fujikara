import { compileMDX } from '@content-collections/mdx'

import {
  extractSectionData as extractSectionDataUtil,
  extractTag as extractTagUtil,
  findRelatedDocuments as findRelatedDocumentsUtil,
  generateTableOfContents as generateTableOfContentsUtil,
  removeTag as removeTagUtil,
  transformAutolinks as transformAutolinksUtil,
  transformCustomSyntax as transformCustomSyntaxUtil,
  transformKeyValuePairs as transformKeyValuePairsUtil,
} from './mdx-transformers'
import type { Context, Document } from '@content-collections/core'
import type { DocumentReference } from './mdx-transformers'

type CompiledMDX = Awaited<ReturnType<typeof compileMDX>>

// Extend Document type to include content property
interface DocumentWithContent extends Document {
  content: string
}

interface TransformResult extends Record<string, any> {
  body: CompiledMDX
  tableOfContents: CompiledMDX
  sections: string
  related: string
  sidePanel?: CompiledMDX
}

export class MdTransformer {
  private content: string
  private document: DocumentWithContent
  private context: Context
  private extractedTags: Map<string, Array<string>> = new Map()
  private tocHtml = ''
  private sectionsData = '[]'
  private relatedData = '[]'

  constructor(document: DocumentWithContent, context: Context) {
    this.document = document
    this.context = context
    this.content = document.content
  }

  /**
   * Transform key::: value pairs into structured HTML divs
   */
  transformKeyValuePairs(): this {
    this.content = transformKeyValuePairsUtil(this.content)
    return this
  }

  /**
   * Extract content from custom tags and store them
   * @param tagNames - One or more tag names to extract
   */
  extractTag(...tagNames: Array<string>): this {
    for (const tagName of tagNames) {
      const extracted = extractTagUtil(this.content, tagName)
      if (extracted.length > 0) {
        this.extractedTags.set(tagName, extracted)
      }
    }
    return this
  }

  /**
   * Remove custom tags from the main content
   * @param tagNames - One or more tag names to remove
   */
  removeTag(...tagNames: Array<string>): this {
    for (const tagName of tagNames) {
      this.content = removeTagUtil(this.content, tagName)
    }
    return this
  }

  /**
   * Transform document titles in content to markdown links
   * @param allDocuments - All available documents for linking
   */
  transformAutolinks(allDocuments: Array<DocumentReference>): this {
    this.content = transformAutolinksUtil(
      this.content,
      this.document._meta.path,
      allDocuments,
    )
    return this
  }

  /**
   * Transform custom bracket syntax [tag]...[/tag] into HTML divs
   */
  transformCustomSyntax(): this {
    this.content = transformCustomSyntaxUtil(this.content)
    return this
  }

  /**
   * Generate table of contents HTML from current content
   */
  generateTableOfContents(): this {
    this.tocHtml = generateTableOfContentsUtil(this.content)
    return this
  }

  /**
   * Extract section metadata for navigation
   */
  extractSectionData(): this {
    const sectionsData = extractSectionDataUtil(this.content)
    this.sectionsData = JSON.stringify(sectionsData)
    return this
  }

  /**
   * Find related documents based on content
   * @param allDocuments - All available documents
   */
  findRelatedDocuments(allDocuments: Array<DocumentReference>): this {
    const relatedDocuments = findRelatedDocumentsUtil(
      this.content,
      this.document._meta.path,
      allDocuments,
    )
    this.relatedData = JSON.stringify(relatedDocuments)
    return this
  }

  /**
   * Compile all content (main, TOC, and extracted tags) to MDX
   */
  compile(): this {
    return this
  }

  /**
   * Get the final transformed result
   */
  async getResult(): Promise<TransformResult> {
    // Compile the main MDX content
    const body = await compileMDX(this.context, {
      ...this.document,
      content: this.content,
    })

    // Compile table of contents as MDX
    const tableOfContents = await compileMDX(this.context, {
      ...this.document,
      content: this.tocHtml,
    })

    // Process extracted tags (e.g., sidepanel)
    let sidePanel: CompiledMDX | undefined = undefined

    const sidepanelTags = this.extractedTags.get('sidepanel')
    if (sidepanelTags && sidepanelTags.length > 0) {
      // Combine all sidepanel instances into one string
      const combinedSidePanel = sidepanelTags.join('\n\n')

      // Transform the sidepanel content (custom syntax)
      const transformedSidePanel = transformCustomSyntaxUtil(combinedSidePanel)

      // Compile the sidepanel content separately
      sidePanel = await compileMDX(this.context, {
        ...this.document,
        content: transformedSidePanel,
      })
    }

    // Spread the original document to preserve all its properties (title, _meta, etc.)
    const result: TransformResult = {
      ...this.document,
      body,
      tableOfContents,
      sections: this.sectionsData,
      related: this.relatedData,
    }

    if (sidePanel) {
      result.sidePanel = sidePanel
    }

    return result
  }

  /**
   * Apply autolinks to extracted tags
   * @param tagName - Tag name to apply autolinks to
   * @param allDocuments - All available documents for linking
   */
  applyAutolinksToTag(
    tagName: string,
    allDocuments: Array<DocumentReference>,
  ): this {
    const tags = this.extractedTags.get(tagName)
    if (tags && tags.length > 0) {
      const transformedTags = tags.map((tag) =>
        transformAutolinksUtil(tag, this.document._meta.path, allDocuments),
      )
      this.extractedTags.set(tagName, transformedTags)
    }
    return this
  }
}
