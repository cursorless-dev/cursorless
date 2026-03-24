import type { TextDocument, TreeSitter } from "@cursorless/lib-common";
import * as path from "node:path";
import { getCursorlessRepoRoot } from "@cursorless/lib-node-common";
import type { Tree } from "web-tree-sitter";
import { Parser, Query, Language } from "web-tree-sitter";

interface LanguageConf {
  language: Language;
  parser: Parser;
}

const languageCache = new Map<string, LanguageConf>();
let initPromise: Promise<void> | undefined;

function initTreeSitter() {
  initPromise ??= Parser.init();
  return initPromise;
}

export class TestTreeSitter implements TreeSitter {
  getTree(document: TextDocument): Tree {
    const language = languageCache.get(document.languageId);

    if (language == null) {
      throw new Error(`Language not loaded: ${document.languageId}`);
    }

    const tree = language.parser.parse(document.getText());

    if (tree == null) {
      throw new Error(
        `Failed to parse document with language ${document.languageId}`,
      );
    }

    return tree;
  }

  async loadLanguage(languageId: string): Promise<boolean> {
    if (idToParser[languageId] == null) {
      return false;
    }

    if (!languageCache.has(languageId)) {
      await initTreeSitter();
      const parserName = idToParser[languageId];
      const wasmFilePath = getWasmFilePath(parserName);
      const language = await Language.load(wasmFilePath);
      const parser = new Parser();
      parser.setLanguage(language);
      languageCache.set(languageId, { language, parser });
    }

    return true;
  }

  createQuery(languageId: string, source: string): Query | undefined {
    const language = languageCache.get(languageId);
    if (language == null) {
      return undefined;
    }
    return new Query(language.language, source);
  }
}

function getWasmFilePath(parserName: string) {
  return path.join(
    getCursorlessRepoRoot(),
    "packages/test-runner/node_modules/@cursorless/tree-sitter-wasms/out",
    `${parserName}.wasm`,
  );
}

const idToParser: Record<string, string> = {
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
