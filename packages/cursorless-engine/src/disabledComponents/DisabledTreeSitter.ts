import type { TextDocument, Range } from "@cursorless/common";
import type { SyntaxNode, Tree, Language } from "web-tree-sitter";
import type { TreeSitter } from "../typings/TreeSitter";

export class DisabledTreeSitter implements TreeSitter {
  getNodeAtLocation(_document: TextDocument, _range: Range): SyntaxNode {
    throw new Error("Tree sitter not provided");
  }

  getTree(_document: TextDocument): Tree {
    throw new Error("Tree sitter not provided");
  }

  getLanguage(_languageId: string): Language | undefined {
    return undefined;
  }

  loadLanguage(_languageId: string): Promise<boolean> {
    return Promise.resolve(false);
  }
}
