import type { Range, TextDocument } from "@cursorless/common";
import type { TreeSitter } from "@cursorless/cursorless-engine";
import type { Language, SyntaxNode, Tree } from "web-tree-sitter";

export class TalonJsTreeSitter implements TreeSitter {
  getNodeAtLocation(_document: TextDocument, _range: Range): SyntaxNode {
    throw Error("getNodeAtLocation not implemented");
  }

  getTree(_document: TextDocument): Tree {
    throw Error("getTree not implemented");
  }

  loadLanguage(_languageId: string): Promise<boolean> {
    return Promise.resolve(false);
  }

  getLanguage(_languageId: string): Language | undefined {
    return undefined;
  }
}
