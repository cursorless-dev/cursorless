/**
 * The language IDs that we have full tree-sitter support for using our legacy
 * modifiers.
 */
export const legacyLanguageIds = [
  "clojure",
  "latex",
  "ruby",
  "rust",
  "scala",
] as const;

export type LegacyLanguageId = (typeof legacyLanguageIds)[number];
