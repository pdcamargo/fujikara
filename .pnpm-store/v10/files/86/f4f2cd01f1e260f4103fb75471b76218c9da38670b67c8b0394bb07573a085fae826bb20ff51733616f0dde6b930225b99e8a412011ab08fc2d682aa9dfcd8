"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/react/client.tsx
var client_exports = {};
__export(client_exports, {
  MDXContent: () => MDXContent,
  useMDXComponent: () => useMDXComponent
});
module.exports = __toCommonJS(client_exports);
var import_client = require("mdx-bundler/client/index.js");
var import_react = require("react");
var import_jsx_runtime = require("react/jsx-runtime");
function useMDXComponent(code) {
  return (0, import_react.useMemo)(() => (0, import_client.getMDXComponent)(code), [code]);
}
function MDXContent({ code, ...props }) {
  const Component = useMDXComponent(code);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Component, { ...props });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  MDXContent,
  useMDXComponent
});
