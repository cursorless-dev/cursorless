/**
 * Mapping from language IDs to tree-sitter WASM module names.
 * This mapping matches the one used by vscode-parse-tree extension.
 *
 * AUTO-GENERATED - Do not edit manually.
 * Update using: cursorless-jetbrains/scripts/update-wasm-and-scm.sh mapping
 *
 * @see https://github.com/cursorless-dev/vscode-parse-tree/blob/main/src/extension.ts
 */
export const languageToWasmModule: Record<string, string> = {
  "java-properties": "tree-sitter-properties",
  "talon-list": "tree-sitter-talon",
  agda: "tree-sitter-agda",
  c: "tree-sitter-c",
  clojure: "tree-sitter-clojure",
  cpp: "tree-sitter-cpp",
  csharp: "tree-sitter-c_sharp",
  css: "tree-sitter-css",
  dart: "tree-sitter-dart",
  elixir: "tree-sitter-elixir",
  elm: "tree-sitter-elm",
  gdscript: "tree-sitter-gdscript",
  gleam: "tree-sitter-gleam",
  go: "tree-sitter-go",
  haskell: "tree-sitter-haskell",
  html: "tree-sitter-html",
  java: "tree-sitter-java",
  javascript: "tree-sitter-javascript",
  javascriptreact: "tree-sitter-javascript",
  json: "tree-sitter-json",
  jsonc: "tree-sitter-json",
  jsonl: "tree-sitter-json",
  julia: "tree-sitter-julia",
  kotlin: "tree-sitter-kotlin",
  latex: "tree-sitter-latex",
  lua: "tree-sitter-lua",
  markdown: "tree-sitter-markdown",
  nix: "tree-sitter-nix",
  perl: "tree-sitter-perl",
  php: "tree-sitter-php",
  properties: "tree-sitter-properties",
  python: "tree-sitter-python",
  r: "tree-sitter-r",
  ruby: "tree-sitter-ruby",
  rust: "tree-sitter-rust",
  scala: "tree-sitter-scala",
  scm: "tree-sitter-query",
  scss: "tree-sitter-scss",
  shellscript: "tree-sitter-bash",
  sparql: "tree-sitter-sparql",
  starlark: "tree-sitter-python",
  swift: "tree-sitter-swift",
  talon: "tree-sitter-talon",
  terraform: "tree-sitter-hcl",
  typescript: "tree-sitter-typescript",
  typescriptreact: "tree-sitter-tsx",
  xml: "tree-sitter-xml",
  yaml: "tree-sitter-yaml",
  zig: "tree-sitter-zig",
};

/**
 * Get the WASM module name for a given language ID.
 * Falls back to `tree-sitter-${languageId}` if no mapping exists.
 */
export function getWasmModuleName(languageId: string): string {
  return languageToWasmModule[languageId] ?? `tree-sitter-${languageId}`;
}
