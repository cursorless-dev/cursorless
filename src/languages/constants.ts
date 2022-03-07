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
  "markdown",
  "python",
  "scala",
  "typescript",
  "typescriptreact",
  "xml",
] as const;

export type SupportedLanguageId = typeof supportedLanguageIds[number];
