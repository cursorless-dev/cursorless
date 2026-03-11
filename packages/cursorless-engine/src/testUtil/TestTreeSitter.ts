import type { Range, TextDocument, TreeSitter } from "@cursorless/common";
import { createRequire } from "node:module";
import * as path from "node:path";
import type {
  Node,
  Tree,
  Parser as TreeSitterParser,
  Language as TreeSitterLanguage,
  Query as TreeSitterQuery,
} from "web-tree-sitter";

// Force the CommonJS entrypoint because the ESM one crashes in this test
// runtime before we get a chance to initialize tree-sitter.
const moduleRequire = createRequire(__filename);

const {
  Language,
  Parser,
  Query,
}: {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  Parser: typeof import("web-tree-sitter").Parser;
  Language: typeof TreeSitterLanguage;
  Query: typeof TreeSitterQuery;
} = moduleRequire("web-tree-sitter");

interface Language {
  language: TreeSitterLanguage;
  parser: TreeSitterParser;
}

const languageCache = new Map<string, Language>();
let initPromise: Promise<void> | undefined;

function initTreeSitter() {
  initPromise ??= Parser.init();
  return initPromise;
}

export class TestTreeSitter implements TreeSitter {
  getNodeAtLocation(_document: TextDocument, _range: Range): Node {
    throw new Error("getNodeAtLocation: not implemented.");
  }

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

  createQuery(languageId: string, source: string): TreeSitterQuery | undefined {
    const language = languageCache.get(languageId);
    if (language == null) {
      return undefined;
    }
    return new Query(language.language, source);
  }
}

function getWasmFilePath(parserName: string) {
  const fileName = `${parserName}.wasm`;
  return path.join(
    __dirname,
    "../../../../node_modules/@cursorless/tree-sitter-wasms/out",
    fileName,
  );
}

const idToParser: Record<string, string> = {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  "java-properties": "tree-sitter-properties",
  // eslint-disable-next-line @typescript-eslint/naming-convention
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
