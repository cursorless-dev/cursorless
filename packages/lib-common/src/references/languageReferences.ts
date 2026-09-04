interface LanguageReference {
  name: string;
  shortName?: string;
}

export type LanguageId =
  | "c"
  | "cpp"
  | "csharp"
  | "clojure"
  | "css"
  | "dart"
  | "go"
  | "html"
  | "java"
  | "javascript"
  | "javascriptreact"
  | "json"
  | "jsonc"
  | "jsonl"
  | "kotlin"
  | "latex"
  | "lua"
  | "markdown"
  | "php"
  | "plaintext"
  | "properties"
  | "python"
  | "r"
  | "ruby"
  | "rust"
  | "scala"
  | "scm"
  | "scss"
  | "talon"
  | "talon-list"
  | "typescript"
  | "typescriptreact"
  | "xml"
  | "yaml";

export const languageReferences: Record<LanguageId, LanguageReference> = {
  c: {
    name: "C",
  },
  cpp: {
    name: "C++",
  },
  csharp: {
    name: "C#",
  },
  clojure: {
    name: "Clojure",
  },
  css: {
    name: "CSS",
  },
  dart: {
    name: "Dart",
  },
  go: {
    name: "Go",
  },
  html: {
    name: "HTML",
  },
  java: {
    name: "Java",
  },
  javascript: {
    name: "JavaScript",
  },
  javascriptreact: {
    name: "JavaScript React",
  },
  json: {
    name: "JSON",
  },
  jsonc: {
    name: "JSON with comments (JSONC)",
    shortName: "JSONC",
  },
  jsonl: {
    name: "JSON lines (JSONL)",
    shortName: "JSONL",
  },
  kotlin: {
    name: "Kotlin",
  },
  latex: {
    name: "LaTeX",
  },
  lua: {
    name: "Lua",
  },
  markdown: {
    name: "Markdown",
  },
  php: {
    name: "PHP",
  },
  plaintext: {
    name: "Plaintext",
  },
  properties: {
    name: "Properties",
  },
  python: {
    name: "Python",
  },
  r: {
    name: "R",
  },
  ruby: {
    name: "Ruby",
  },
  rust: {
    name: "Rust",
  },
  scala: {
    name: "Scala",
  },
  scm: {
    name: "Tree-sitter query (SCM)",
    shortName: "Tree-sitter query",
  },
  scss: {
    name: "SCSS",
  },
  talon: {
    name: "Talon",
  },
  "talon-list": {
    name: "Talon list",
  },
  typescript: {
    name: "TypeScript",
  },
  typescriptreact: {
    name: "TypeScript React",
  },
  xml: {
    name: "XML",
  },
  yaml: {
    name: "YAML",
  },
} as const;

export function isLanguageId(value: string): value is LanguageId {
  return Object.hasOwn(languageReferences, value);
}

export function getLanguageId(value: string): LanguageId {
  if (isLanguageId(value)) {
    return value;
  }
  throw new Error(`Unknown language id: ${value}`);
}
