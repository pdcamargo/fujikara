// src/react/server.tsx
import * as React from "react";
import * as ReactDOM from "react-dom";
import * as _jsx_runtime from "react/jsx-runtime";
import { jsx } from "react/jsx-runtime";
function useMDXComponent(code) {
  const scope = { React, ReactDOM, _jsx_runtime };
  const fn = new Function(...Object.keys(scope), code);
  return fn(...Object.values(scope)).default;
}
function MDXContent({ code, ...props }) {
  const Component = useMDXComponent(code);
  return /* @__PURE__ */ jsx(Component, { ...props });
}
export {
  MDXContent,
  useMDXComponent
};
