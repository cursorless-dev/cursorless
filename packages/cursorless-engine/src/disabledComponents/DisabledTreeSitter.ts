import type { TextDocument, Range } from "@cursorless/common";
import type { SyntaxNode, Tree, Language } from "web-tree-sitter";
import type { TreeSitter } from "../typings/TreeSitter";

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

  getNodeAtLocation(_document: TextDocument, _range: Range): SyntaxNode {
    throw new Error("Tree sitter not provided");
  }
}
