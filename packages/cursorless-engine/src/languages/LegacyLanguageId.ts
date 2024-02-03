/**
 * The language IDs that we have full tree-sitter support for using our legacy
 * modifiers.
 */
export const legacyLanguageIds = [
  "c",
  "clojure",
  "cpp",
  "css",
  "csharp",
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
  "scala",
  "scss",
  "rust",
  "typescript",
  "typescriptreact",
  "xml",
];

export type LegacyLanguageId = (typeof legacyLanguageIds)[number];
