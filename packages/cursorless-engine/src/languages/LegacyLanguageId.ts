/**
 * The language IDs that we have full tree-sitter support for using our legacy
 * modifiers.
 */
export const legacyLanguageIds = [
  "clojure",
  "css",
  "latex",
  "markdown",
  "php",
  "python",
  "ruby",
  "rust",
  "scala",
  "scss",
] as const;

export type LegacyLanguageId = (typeof legacyLanguageIds)[number];
