export const supportedLanguageIds = [
  "c",
  "clojure",
  "cpp",
  "csharp",
  "go",
  "html",
  "java",
  "javascript",
  "javascriptreact",
  "json",
  "jsonc",
  "python",
  "rust",
  "scala",
  "typescript",
  "typescriptreact",
] as const;

export type SupportedLanguageId = typeof supportedLanguageIds[number];
