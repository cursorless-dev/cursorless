import { capitalize } from "./stringUtils";

export function prettifyLanguageName(name: string): string {
  switch (name) {
    case "cpp":
      return "C++";
    case "csharp":
      return "C#";
    case "javascript":
      return "JavaScript";
    case "typescript":
      return "TypeScript";
    case "javascriptreact":
      return "JavaScript React";
    case "typescriptreact":
      return "TypeScript React";
    case "jsonl":
      return "JSON lines (JSONL)";
    case "jsonc":
      return "JSON with comments (JSONC)";
    case "scm":
      return "Tree sitter query language (scm)";
    case "css":
    case "scss":
    case "json":
    case "php":
    case "html":
    case "xml":
      return name.toUpperCase();
    default:
      return capitalize(name);
  }
}
