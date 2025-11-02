// src/react/client.tsx
import { getMDXComponent } from "mdx-bundler/client/index.js";
import { useMemo } from "react";
import { jsx } from "react/jsx-runtime";
function useMDXComponent(code) {
  return useMemo(() => getMDXComponent(code), [code]);
}
function MDXContent({ code, ...props }) {
  const Component = useMDXComponent(code);
  return /* @__PURE__ */ jsx(Component, { ...props });
}
export {
  MDXContent,
  useMDXComponent
};
