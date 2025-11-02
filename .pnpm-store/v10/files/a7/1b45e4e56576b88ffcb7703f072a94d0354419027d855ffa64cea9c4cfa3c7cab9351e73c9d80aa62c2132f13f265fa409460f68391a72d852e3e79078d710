"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  compileMDX: () => compileMDX
});
module.exports = __toCommonJS(src_exports);
var import_fs = require("fs");
var import_promises = __toESM(require("fs/promises"), 1);
var import_mdx_bundler = require("mdx-bundler");
var import_path = __toESM(require("path"), 1);
async function appendFile(files, importPath, filePath) {
  files[importPath] = await import_promises.default.readFile(filePath, "utf-8");
}
async function appendDirectory(files, importPathPrefix, directoryPath) {
  if (!(0, import_fs.existsSync)(directoryPath)) {
    return;
  }
  const fileNames = await import_promises.default.readdir(directoryPath);
  for (const fileName of fileNames) {
    const filePath = import_path.default.join(directoryPath, fileName);
    const { name } = import_path.default.parse(filePath);
    files[`${importPathPrefix}/${name}`] = await import_promises.default.readFile(filePath, "utf-8");
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
  const { code } = await (0, import_mdx_bundler.bundleMDX)({
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  compileMDX
});
