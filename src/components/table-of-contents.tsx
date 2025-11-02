import { MDXContent } from '@content-collections/mdx/react'
import { ChevronDown } from 'lucide-react'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from './ui/collapsible'

interface TableOfContentsProps {
  code: string
  defaultOpen?: boolean
}

export function TableOfContents({
  code,
  defaultOpen = true,
}: TableOfContentsProps) {
  return (
    <Collapsible defaultOpen={defaultOpen}>
      <CollapsibleTrigger className="flex items-center justify-between w-full py-2 px-3 text-sm font-semibold bg-muted rounded-none hover:bg-muted/80 transition-colors group">
        <span>Conteúdo</span>
        <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]:rotate-180" />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <MDXContent code={code} />
      </CollapsibleContent>
    </Collapsible>
  )
}
