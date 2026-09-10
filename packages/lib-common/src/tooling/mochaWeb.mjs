import { registerHooks } from "node:module";
import { cwd } from "node:process";
import { pathToFileURL } from "node:url";
import { JSDOM } from "jsdom";

const packageURL = pathToFileURL(`${cwd()}/package.json`).href;
const aliases = {
  react: "preact/compat",
  "react-dom": "preact/compat",
  "react-dom/test-utils": "preact/test-utils",
  "react/jsx-runtime": "preact/jsx-runtime",
  "react/jsx-dev-runtime": "preact/jsx-dev-runtime",
};
// Use Preact's ESM exports for both tests and React-compatible dependencies.
// Resolving with require() selects the CommonJS JSX runtime, whose named
// exports (including Fragment) are not reliably available to ESM imports.
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (/\.(css|scss)$/u.test(specifier)) {
      return {
        url: "data:text/javascript,export default {};",
        shortCircuit: true,
      };
    }
    const alias = aliases[specifier] ?? specifier;
    if (alias === "preact" || alias.startsWith("preact/")) {
      return nextResolve(alias, {
        ...context,
        parentURL: packageURL,
        conditions: ["node", "import", "default"],
      });
    }
    return nextResolve(specifier, context);
  },
});

const dom = new JSDOM("", {
  url: "http://localhost/",
  pretendToBeVisual: true,
});
for (const name of [
  "window",
  "document",
  "navigator",
  "HTMLElement",
  "Node",
  "Event",
  "CustomEvent",
  "requestAnimationFrame",
  "cancelAnimationFrame",
]) {
  Object.defineProperty(globalThis, name, {
    configurable: true,
    value: dom.window[name],
    writable: true,
  });
}
