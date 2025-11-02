import { Link, createFileRoute, notFound } from '@tanstack/react-router'
import { MDXContent } from '@content-collections/mdx/react'
import { allMdxes } from 'content-collections'
import { FloatingNavigation } from '@/components/floating-navigation'
import { TableOfContents } from '@/components/table-of-contents'
import { ReadingProgressBar } from '@/components/reading-progress-bar'

const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim()
}

export const Route = createFileRoute('/$')({
  component: RouteComponent,
  beforeLoad(ctx) {
    const { _splat = '' } = ctx.params

    const slug = _splat.startsWith('/') ? _splat.slice(1) : _splat

    const transformedMdxes = allMdxes.map((md) => ({
      ...md,
      _meta: {
        ...md._meta,
        path: md._meta.path
          .split(' ')
          .map((p) => p.toLowerCase())
          .join('-'),
      },
    }))

    const mdx = transformedMdxes.find((md) => md._meta.path === slug)

    if (!mdx) {
      throw notFound({ data: { message: 'Not found' } })
    }

    return { mdx }
  },
})

const Components = {
  a: ({
    children,
    ...props
  }: { children: React.ReactNode } & React.ComponentProps<typeof Link>) => (
    <Link {...props}>{children}</Link>
  ),
  h1: ({
    children,
    id,
    ...props
  }: {
    children: React.ReactNode
    id?: string
  } & React.ComponentProps<'h1'>) => (
    <h1
      {...props}
      id={children ? generateSlug(children.toString()) : undefined}
    >
      {children}
    </h1>
  ),
  h2: ({
    children,
    id,
    ...props
  }: {
    children: React.ReactNode
    id?: string
  } & React.ComponentProps<'h2'>) => (
    <h2
      {...props}
      id={children ? generateSlug(children.toString()) : undefined}
    >
      {children}
    </h2>
  ),
  h3: ({
    children,
    id,
    ...props
  }: {
    children: React.ReactNode
    id?: string
  } & React.ComponentProps<'h3'>) => (
    <h3
      {...props}
      id={children ? generateSlug(children.toString()) : undefined}
    >
      {children}
    </h3>
  ),
  h4: ({
    children,
    id,
    ...props
  }: {
    children: React.ReactNode
    id?: string
  } & React.ComponentProps<'h4'>) => (
    <h4
      {...props}
      id={children ? generateSlug(children.toString()) : undefined}
    >
      {children}
    </h4>
  ),
  h5: ({
    children,
    id,
    ...props
  }: {
    children: React.ReactNode
    id?: string
  } & React.ComponentProps<'h5'>) => (
    <h5
      {...props}
      id={children ? generateSlug(children.toString()) : undefined}
    >
      {children}
    </h5>
  ),
}

function RouteComponent() {
  const { mdx } = Route.useRouteContext()

  return (
    <>
      {/* Reading progress bar */}
      {mdx?.sections && <ReadingProgressBar sectionsJson={mdx.sections} />}

      <div className="prose dark:prose-invert max-w-[1360px] w-full p-10 flex items-start gap-15 container mx-auto">
        <div className="max-w-full flex flex-col gap-4">
          {mdx?.tableOfContents && (
            <TableOfContents code={mdx.tableOfContents} />
          )}

          <div>
            <MDXContent components={Components} code={mdx?.body || ''} />
          </div>
        </div>
        <div className="not-prose">
          {mdx?.sidePanel && (
            <MDXContent components={Components} code={mdx.sidePanel} />
          )}
        </div>
      </div>

      {/* Floating navigation bar */}
      {mdx?.sections && <FloatingNavigation sectionsJson={mdx.sections} />}
    </>
  )
}
