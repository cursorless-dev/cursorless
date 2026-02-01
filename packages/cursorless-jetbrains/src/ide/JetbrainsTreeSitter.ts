import type { Range, TextDocument, TreeSitter } from "@cursorless/common";
import type { Language, Node, Tree } from "web-tree-sitter";
import { Query } from "web-tree-sitter";
import { Parser, Language as ParserLanguage } from "web-tree-sitter";
import { pathJoin } from "./pathJoin";

export class JetbrainsTreeSitter implements TreeSitter {
  constructor(private wasmDirectory: string) {}

  parsers = new Map<string, Parser>();

  getTree(document: TextDocument): Tree {
    if (this.getLanguage(document.languageId)) {
      const parser = this.parsers.get(document.languageId);
      if (parser) {
        const tree = parser.parse(document.getText());
        if (!tree) {
          throw new Error("Failed to parse document");
        }
        return tree;
      }
    }
    throw new Error("Language not supported");
  }

  async loadLanguage(languageId: string): Promise<boolean> {
    // console.log(`Loading language ${languageId}`);
    const parser = new Parser();
    const filePath = pathJoin(
      this.wasmDirectory,
      `tree-sitter-${languageId}.wasm`,
    );
    const language = await ParserLanguage.load(filePath);
    parser.setLanguage(language);
    this.parsers.set(languageId, parser);
    return true;
  }

  getLanguage(languageId: string): Language | undefined {
    const parser = this.parsers.get(languageId);
    return parser?.language || undefined;
  }

  getNodeAtLocation(document: TextDocument, range: Range): Node {
    const tree = this.getTree(document);
    const node = tree.rootNode.descendantForPosition(
      {
        row: range.start.line,
        column: range.start.character,
      },
      {
        row: range.end.line,
        column: range.end.character,
      },
    );
    if (!node) {
      throw new Error("Node not found at location");
    }
    return node;
  }

  createQuery(languageId: string, source: string): Query | undefined {
    const language = this.getLanguage(languageId);
    if (!language) {
      return undefined;
    }
    
    try {
      return new Query(language, source);
    } catch (error) {
      console.error(`Failed to create query for language ${languageId}:`, error);
      return undefined;
    }
  }
}
