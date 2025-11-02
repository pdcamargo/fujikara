don't read mdx folder when code is requested, it's waist of time and memory, it's always going to be markdown and if it's being processed by content-collections, it's only going to consider the valid ones, and you know it's valid because of the zod schema

always run tsc with no emit
always build
