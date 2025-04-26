import type { Range, TextDocument, TreeSitter } from "@cursorless/common";
import type { Language, Node, Tree } from "web-tree-sitter";

export class DisabledTreeSitter implements TreeSitter {
  getTree(_document: TextDocument): Tree {
    throw new Error("Tree sitter not provided");
  }

  loadLanguage(_languageId: string): Promise<boolean> {
    return Promise.resolve(false);
  }

  getLanguage(_languageId: string): Language | undefined {
    throw new Error("Tree sitter not provided");
  }

  getNodeAtLocation(_document: TextDocument, _range: Range): Node {
    throw new Error("Tree sitter not provided");
  }
}
