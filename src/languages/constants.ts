export const supportedLanguageIds = [
  "c",
  "cpp",
  "csharp",
  "html",
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
