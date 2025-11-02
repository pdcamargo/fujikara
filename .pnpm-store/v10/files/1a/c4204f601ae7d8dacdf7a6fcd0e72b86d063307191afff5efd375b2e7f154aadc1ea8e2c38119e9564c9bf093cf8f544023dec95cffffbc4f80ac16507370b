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

// src/react/server.tsx
var server_exports = {};
__export(server_exports, {
  MDXContent: () => MDXContent,
  useMDXComponent: () => useMDXComponent
});
module.exports = __toCommonJS(server_exports);
var React = __toESM(require("react"), 1);
var ReactDOM = __toESM(require("react-dom"), 1);
var _jsx_runtime = __toESM(require("react/jsx-runtime"), 1);
var import_jsx_runtime = require("react/jsx-runtime");
function useMDXComponent(code) {
  const scope = { React, ReactDOM, _jsx_runtime };
  const fn = new Function(...Object.keys(scope), code);
  return fn(...Object.values(scope)).default;
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
