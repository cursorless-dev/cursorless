/** Languages with first party Cursorless tree-sitter support */
export const supportedLanguageIds = [
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
] as const;

/**
 * All language IDs that we might reference but don't have full support.
 * (e.g., for token customization).
 */
export const allLanguageIds = [
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
  "shellscript",
  "rust",
  "typescript",
  "typescriptreact",
  "xml",
] as const;

export type SupportedLanguageId = typeof supportedLanguageIds[number];
export type AllLanguageId = typeof allLanguageIds[number];
