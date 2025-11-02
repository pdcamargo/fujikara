import { Context, Meta } from '@content-collections/core';
import { Pluggable } from 'unified';

type Document = {
    _meta: Meta;
    content: string;
};
type FileAppender = ReturnType<typeof createFileAppender>;
type Options = {
    cwd?: string;
    files?: (appender: FileAppender) => void;
    remarkPlugins?: Pluggable[];
    rehypePlugins?: Pluggable[];
};
declare function createFileAppender(tasks: Promise<void>[], files: Record<string, string>): {
    content: (importPath: string, content: string) => void;
    file: (importPath: string, filePath: string) => void;
    directory: (importPath: string, directoryPath: string) => void;
};
declare function compileMDX({ cache }: Pick<Context, "cache">, document: Document, options?: Options): Promise<string>;

export { type Options, compileMDX };
