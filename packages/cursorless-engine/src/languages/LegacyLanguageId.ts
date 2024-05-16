/**
 * The language IDs that we have full tree-sitter support for using our legacy
 * modifiers.
 */
export const legacyLanguageIds = [
  "c",
  "clojure",
  "cpp",
  "csharp",
  "css",
  "go",
  "html",
  "java",
  "javascript",
  "javascriptreact",
  "json",
  "jsonc",
  "latex",
  "markdown",
  "php",
  "python",
  "ruby",
  "rust",
  "scala",
  "scss",
  "typescript",
  "typescriptreact",
  "xml",
];

export type LegacyLanguageId = (typeof legacyLanguageIds)[number];
