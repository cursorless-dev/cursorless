import type { Range, TextDocument, TreeSitter } from "@cursorless/common";
import * as path from "node:path";
import type { Node, Query, Tree } from "web-tree-sitter";
import { Language, Parser } from "web-tree-sitter";

const languageCache = new Map<string, Promise<Language>>();
let initPromise: Promise<void> | undefined;
// const webTreeSitterWasmPath =
//   require.resolve("web-tree-sitter/web-tree-sitter.wasm");

function initTreeSitter() {
  initPromise ??= Parser.init({
    locateFile(scriptName: string) {
      console.log(`locateFile called with ${scriptName}`); // Debug log
      return scriptName;
      //   return scriptName === "web-tree-sitter.wasm"
      //     ? webTreeSitterWasmPath
      //     : scriptName;
    },
  });
  return initPromise;
}

export class TestTreeSitter implements TreeSitter {
  getNodeAtLocation(_document: TextDocument, _range: Range): Node {
    throw new Error("getNodeAtLocation: not implemented.");
  }

  getTree(_document: TextDocument): Tree {
    throw new Error("getTree: not implemented.");
  }

  async loadLanguage(languageId: string): Promise<boolean> {
    console.log(`loadLanguage called with languageId: ${languageId}`); // Debug log
    if (!languageCache.has(languageId)) {
      console.log("before");
      await initTreeSitter();
      console.log("after");
      const parserName = idToParser[languageId] ?? languageId;
      const wasmFilePath = getWasmFilePath(parserName);
      const promise = Language.load(wasmFilePath);
      languageCache.set(languageId, promise);
    }

    await languageCache.get(languageId);

    return true;
  }

  createQuery(_languageId: string, _source: string): Query | undefined {
    throw new Error("createQuery: not implemented.");
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
