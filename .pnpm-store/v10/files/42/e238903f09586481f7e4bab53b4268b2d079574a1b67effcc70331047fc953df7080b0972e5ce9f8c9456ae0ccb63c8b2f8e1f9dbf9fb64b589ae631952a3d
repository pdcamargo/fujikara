// src/index.ts
import { existsSync } from "fs";
import fs from "fs/promises";
import { bundleMDX } from "mdx-bundler";
import path from "path";
async function appendFile(files, importPath, filePath) {
  files[importPath] = await fs.readFile(filePath, "utf-8");
}
async function appendDirectory(files, importPathPrefix, directoryPath) {
  if (!existsSync(directoryPath)) {
    return;
  }
  const fileNames = await fs.readdir(directoryPath);
  for (const fileName of fileNames) {
    const filePath = path.join(directoryPath, fileName);
    const { name } = path.parse(filePath);
    files[`${importPathPrefix}/${name}`] = await fs.readFile(filePath, "utf-8");
  }
}
function createFileAppender(tasks, files) {
  return {
    content: (importPath, content) => {
      files[importPath] = content;
    },
    file: (importPath, filePath) => {
      tasks.push(appendFile(files, importPath, filePath));
    },
    directory: (importPath, directoryPath) => {
      tasks.push(appendDirectory(files, importPath, directoryPath));
    }
  };
}
async function createFiles(options) {
  const files = {};
  if (options.files) {
    const tasks = [];
    const appender = createFileAppender(tasks, files);
    options.files(appender);
    await Promise.all(tasks);
  }
  return files;
}
function addMetaToVFile(_meta) {
  return () => (_, vFile) => {
    Object.assign(vFile.data, { _meta });
  };
}
async function compile(document, options = {}) {
  const files = await createFiles(options);
  const { code } = await bundleMDX({
    source: document.content,
    cwd: options.cwd,
    files,
    esbuildOptions(options2) {
      if (!options2.define) {
        options2.define = {};
      }
      const env = process.env.NODE_ENV ?? "production";
      options2.define["process.env.NODE_ENV"] = JSON.stringify(env);
      return options2;
    },
    mdxOptions(mdxOptions) {
      mdxOptions.rehypePlugins = [...options.rehypePlugins ?? []];
      mdxOptions.remarkPlugins = [
        addMetaToVFile(document._meta),
        ...options.remarkPlugins ?? []
      ];
      return mdxOptions;
    }
  });
  return code;
}
function createCacheKey(document) {
  const { content, _meta } = document;
  return { content, _meta };
}
function compileMDX({ cache }, document, options) {
  const cacheKey = createCacheKey(document);
  return cache(cacheKey, (doc) => compile(doc, options), {
    key: "__mdx"
  });
}
export {
  compileMDX
};
