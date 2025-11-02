/**
 * Transforms info-group pair syntax into structured HTML
 *
 * Converts groups of consecutive lines with `key::: value` format into
 * a structured div layout with semantic class names.
 *
 * @param content - The raw MDX content string
 * @returns The transformed content with info-group pairs replaced
 *
 * @example
 * ```ts
 * const input = `Data de Nascimento::: 17 de Março (Ano -57)
 * Idade::: 157 Anos
 * Sexo::: M`
 *
 * const output = transformKeyValuePairs(input)
 * // Returns:
 * // <div className="info-group-group">
 * //   <div className="info-group-row">
 * //     <span className="info-group-key">Data de Nascimento</span>
 * //     <span className="info-group-value">17 de Março (Ano -57)</span>
 * //   </div>
 * //   <div className="info-group-row">
 * //     <span className="info-group-key">Idade</span>
 * //     <span className="info-group-value">157 Anos</span>
 * //   </div>
 * //   <div className="info-group-row">
 * //     <span className="info-group-key">Sexo</span>
 * //     <span className="info-group-value">M</span>
 * //   </div>
 * // </div>
 * ```
 */
export function transformKeyValuePairs(content: string): string {
  // Match groups of consecutive lines containing `:::`
  // This pattern finds one or more consecutive lines that contain `:::`
  const groupPattern = /(?:^.+:::.+$\n?)+/gm

  const transformed = content.replace(groupPattern, (group) => {
    // Split the group into individual lines and filter out empty ones
    const lines = group.trim().split('\n').filter(Boolean)

    // Calculate the longest key length for dynamic width
    let theLargestKeyLength = 0

    // Transform each line into a info-group row
    const rows = lines
      .map((line) => {
        // Split on `:::` to separate key and value
        const [key, ...valueParts] = line.split(':::')
        const value = valueParts.join(':::').trim() // Rejoin in case value contains `:::`

        if (!key || !value) return '' // Skip malformed lines

        const trimmedKey = key.trim()
        // Track the longest key length
        theLargestKeyLength = Math.max(
          theLargestKeyLength,
          trimmedKey.replaceAll(' ', '').length,
        )

        return `  <div className="info-group-row">
    <span className="info-group-key">${trimmedKey}</span>
    <span className="info-group-value">${value}</span>
  </div>`
      })
      .filter(Boolean)
      .join('\n')

    // Wrap all rows in a group div with dynamic key width CSS variable
    return `<div className="info-group" style={{ '--info-group-key-width': '${theLargestKeyLength}ch' }}>
${rows}
</div>`
  })

  return transformed
}

/**
 * Transforms custom bracket syntax into HTML divs with support for multiple classes
 *
 * Converts: [tagname class1 class2]content[/tagname]
 * Into: <div class="tagname class1 class2">content</div>
 *
 * @param content - The raw MDX content string
 * @returns The transformed content with custom syntax replaced
 *
 * @example
 * ```ts
 * // Single class
 * const input1 = '[sidepanel]\nSome content\n[/sidepanel]'
 * const output1 = transformCustomSyntax(input1)
 * // Returns: '<div class="sidepanel">\nSome content\n</div>'
 *
 * // Multiple classes
 * const input2 = '[sidebar highlight featured]\nContent\n[/sidebar]'
 * const output2 = transformCustomSyntax(input2)
 * // Returns: '<div class="sidebar highlight featured">\nContent\n</div>'
 * ```
 */
export function transformCustomSyntax(content: string): string {
  // Regex pattern to match [tagname ...]...[/tagname]
  // - Captures the tag name and optional additional classes
  // - First word is the tag name (used in closing tag)
  // - Additional words become additional CSS classes
  // - Captures everything between opening and closing tags (including newlines)
  // - Uses non-greedy matching to handle multiple instances
  const pattern =
    /\[([a-zA-Z0-9_-]+)(\s+[a-zA-Z0-9_\s-]+)?\]([\s\S]*?)\[\/\1\]/g

  // Replace all matches with <div class="classes...">content</div>
  const transformed = content.replace(
    pattern,
    (_, tagName, additionalClasses, innerContent) => {
      // Combine tag name with any additional classes
      const allClasses = additionalClasses
        ? `${tagName}${additionalClasses}`
        : tagName

      return `<div className="${allClasses}">${innerContent}</div>`
    },
  )

  return transformed
}

/**
 * Extracts all instances of a specific custom tag from content
 *
 * Returns an array of strings, each containing the full tag including brackets
 * and inner content. This is useful for extracting specific content sections
 * before they are transformed into HTML.
 *
 * @param content - The raw MDX content string
 * @param tagName - The name of the tag to extract (e.g., 'sidepanel', 'callout')
 * @returns Array of matched tag strings including brackets and content
 *
 * @example
 * ```ts
 * const content = `
 * [sidepanel]
 * Content 1
 * [/sidepanel]
 *
 * Some text
 *
 * [sidepanel]
 * Content 2
 * [/sidepanel]
 * `
 *
 * const extracted = extractTag(content, 'sidepanel')
 * // Returns: [
 * //   '[sidepanel]\nContent 1\n[/sidepanel]',
 * //   '[sidepanel]\nContent 2\n[/sidepanel]'
 * // ]
 * ```
 */
export function extractTag(content: string, tagName: string): Array<string> {
  // Escape the tag name to prevent regex injection
  const escapedTagName = tagName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

  // Pattern matches [tagName ...]content[/tagName]
  // Captures the entire match including brackets
  const pattern = new RegExp(
    `\\[${escapedTagName}(?:\\s+[a-zA-Z0-9_\\s-]+)?\\][\\s\\S]*?\\[\\/${escapedTagName}\\]`,
    'g',
  )

  const matches = content.match(pattern)
  return matches || []
}

/**
 * Removes all instances of a specific custom tag from content
 *
 * Strips out all occurrences of [tagName]...[/tagName] and returns
 * the cleaned content. Useful for removing extracted sections from
 * the main content before further processing.
 *
 * @param content - The raw MDX content string
 * @param tagName - The name of the tag to remove (e.g., 'sidepanel', 'callout')
 * @returns Content with all instances of the specified tag removed
 *
 * @example
 * ```ts
 * const content = `
 * Main content
 *
 * [sidepanel]
 * Side content
 * [/sidepanel]
 *
 * More main content
 * `
 *
 * const cleaned = removeTag(content, 'sidepanel')
 * // Returns: `
 * // Main content
 * //
 * //
 * //
 * // More main content
 * // `
 * ```
 */
export function removeTag(content: string, tagName: string): string {
  // Escape the tag name to prevent regex injection
  const escapedTagName = tagName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

  // Pattern matches [tagName ...]content[/tagName]
  const pattern = new RegExp(
    `\\[${escapedTagName}(?:\\s+[a-zA-Z0-9_\\s-]+)?\\][\\s\\S]*?\\[\\/${escapedTagName}\\]`,
    'g',
  )

  return content.replace(pattern, '')
}

/**
 * Table of Contents item structure
 */
export interface TocItem {
  id: string
  text: string
  children: Array<TocItem>
}

/**
 * Section data structure for navigation
 */
export interface SectionData {
  id: string
  title: string
  level: number
  numbering: string
}

/**
 * Generates HTML markup for a table of contents from markdown headings
 *
 * Extracts all markdown headings (#, ##, ###, ####) and creates nested
 * HTML divs representing the document hierarchy. Each heading gets a slug
 * ID generated from its text content and is rendered as a clickable link.
 *
 * @param content - The markdown content to parse
 * @returns HTML string with nested TOC structure
 *
 * @example
 * ```ts
 * const content = `
 * # Introduction
 * ## Getting Started
 * ### Installation
 * ## Usage
 * # Advanced Topics
 * `
 *
 * const toc = generateTableOfContents(content)
 * // Returns:
 * // <div className="toc">
 * //   <div className="toc-item toc-level-1">
 * //     <a href="#introduction">Introduction</a>
 * //     <div className="toc-children">
 * //       <div className="toc-item toc-level-2">
 * //         <a href="#getting-started">Getting Started</a>
 * //         ...
 * //       </div>
 * //     </div>
 * //   </div>
 * // </div>
 * ```
 */
export function generateTableOfContents(content: string): string {
  // Extract all markdown headings with their level and text
  // Matches: # Heading, ## Heading, ### Heading, #### Heading
  const headingPattern = /^(#{1,4})\s+(.+)$/gm
  const headings: Array<{ level: number; text: string }> = []

  let match
  while ((match = headingPattern.exec(content)) !== null) {
    const level = match[1].length // Count # symbols
    const text = match[2].trim()
    headings.push({ level, text })
  }

  if (headings.length === 0) {
    return '<div className="toc"></div>'
  }

  // Helper function to generate a slug from heading text
  const generateSlug = (text: string): string => {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .trim()
  }

  // Calculate numbering for each heading
  const counters: Array<number> = [0, 0, 0, 0] // Track counters for levels 1-4

  const headingsWithNumbers = headings.map((heading) => {
    const levelIndex = heading.level - 1

    // Increment counter for current level
    counters[levelIndex]++

    // Reset all deeper level counters
    for (let i = levelIndex + 1; i < counters.length; i++) {
      counters[i] = 0
    }

    // Build number string (e.g., "1.2.3")
    const number = counters
      .slice(0, heading.level)
      .filter((n) => n > 0)
      .join('.')

    return { ...heading, number }
  })

  // Build the nested HTML structure
  let html = '<div className="toc">\n'
  const stack: Array<number> = [] // Track open levels

  for (let i = 0; i < headingsWithNumbers.length; i++) {
    const heading = headingsWithNumbers[i]
    const nextHeading = headingsWithNumbers[i + 1]
    const id = generateSlug(heading.text)

    // Close deeper levels if we're going back up
    while (stack.length > 0 && stack[stack.length - 1] >= heading.level) {
      stack.pop()
      html += `${'  '.repeat(stack.length + 1)}</div>\n` // Close toc-children
      html += `${'  '.repeat(stack.length + 1)}</div>\n` // Close toc-item
    }

    // Open new item
    html += `${'  '.repeat(stack.length + 1)}<div className="toc-item toc-level-${heading.level}">\n`
    html += `${'  '.repeat(stack.length + 2)}<a href="#${id}">\n`
    html += `${'  '.repeat(stack.length + 3)}<span className="toc-number">${heading.number}</span>\n`
    html += `${'  '.repeat(stack.length + 3)}<span className="toc-text">${heading.text}</span>\n`
    html += `${'  '.repeat(stack.length + 2)}</a>\n`

    // If next heading is deeper, open children container
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (nextHeading && nextHeading.level > heading.level) {
      html += `${'  '.repeat(stack.length + 2)}<div className="toc-children">\n`
      stack.push(heading.level)
    } else {
      // Close this item immediately
      html += `${'  '.repeat(stack.length + 1)}</div>\n`
    }
  }

  // Close any remaining open levels
  while (stack.length > 0) {
    stack.pop()
    html += `${'  '.repeat(stack.length + 1)}</div>\n` // Close toc-children
    html += `${'  '.repeat(stack.length + 1)}</div>\n` // Close toc-item
  }

  html += '</div>'
  return html
}

/**
 * Extracts structured section data from markdown content for navigation
 *
 * Similar to generateTableOfContents but returns a flat array of section
 * objects instead of HTML. This is useful for implementing navigation features
 * like "previous/next section" buttons and scroll tracking.
 *
 * @param content - The markdown content to parse
 * @returns Array of section objects with id, title, level, and numbering
 *
 * @example
 * ```ts
 * const content = `
 * # Introduction
 * ## Getting Started
 * ### Installation
 * ## Usage
 * # Advanced Topics
 * `
 *
 * const sections = extractSectionData(content)
 * // Returns: [
 * //   { id: 'introduction', title: 'Introduction', level: 1, numbering: '1' },
 * //   { id: 'getting-started', title: 'Getting Started', level: 2, numbering: '1.1' },
 * //   { id: 'installation', title: 'Installation', level: 3, numbering: '1.1.1' },
 * //   { id: 'usage', title: 'Usage', level: 2, numbering: '1.2' },
 * //   { id: 'advanced-topics', title: 'Advanced Topics', level: 1, numbering: '2' }
 * // ]
 * ```
 */
export function extractSectionData(content: string): Array<SectionData> {
  // Extract all markdown headings with their level and text
  const headingPattern = /^(#{1,4})\s+(.+)$/gm
  const headings: Array<{ level: number; text: string }> = []

  let match
  while ((match = headingPattern.exec(content)) !== null) {
    const level = match[1].length // Count # symbols
    const text = match[2].trim()
    headings.push({ level, text })
  }

  if (headings.length === 0) {
    return []
  }

  // Helper function to generate a slug from heading text
  const generateSlug = (text: string): string => {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .trim()
  }

  // Calculate numbering for each heading
  const counters: Array<number> = [0, 0, 0, 0] // Track counters for levels 1-4

  return headings.map((heading) => {
    const levelIndex = heading.level - 1

    // Increment counter for current level
    counters[levelIndex]++

    // Reset all deeper level counters
    for (let i = levelIndex + 1; i < counters.length; i++) {
      counters[i] = 0
    }

    // Build number string (e.g., "1.2.3")
    const numbering = counters
      .slice(0, heading.level)
      .filter((n) => n > 0)
      .join('.')

    return {
      id: generateSlug(heading.text),
      title: heading.text,
      level: heading.level,
      numbering,
    }
  })
}
