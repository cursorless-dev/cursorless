import { registerHooks } from "node:module";
import { JSDOM } from "jsdom";

/**
 * Prepares Node to run browser component tests by mapping React imports to
 * Preact, replacing stylesheet imports with empty modules, and exposing jsdom
 * browser globals. Call before importing tests or their components.
 */
export function setupWebTests() {
  const packageURL = new URL("../package.json", import.meta.url).href;
  const aliases: Partial<Record<string, string>> = {
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

  // Create a browser-like environment with a localhost origin and animation
  // frame support, then expose the DOM APIs used by components on globalThis.
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
  ] as const) {
    Object.defineProperty(globalThis, name, {
      configurable: true,
      value: dom.window[name],
      writable: true,
    });
  }
}
