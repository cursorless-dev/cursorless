export const supportedLanguageIds = [
  "c",
  "clojure",
  "cpp",
  "csharp",
  "java",
  "javascript",
  "javascriptreact",
  "json",
  "jsonc",
  "python",
  "typescript",
  "typescriptreact",
] as const;

export type SupportedLanguageId = typeof supportedLanguageIds[number];
