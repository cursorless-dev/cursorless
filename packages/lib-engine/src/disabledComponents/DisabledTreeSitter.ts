import type { TextDocument, TreeSitter } from "@cursorless/lib-common";
import type { Query, Tree } from "web-tree-sitter";

export class DisabledTreeSitter implements TreeSitter {
  loadLanguage(_languageId: string): Promise<boolean> {
    return Promise.resolve(false);
  }

  getTree(_document: TextDocument): Tree {
    throw new Error("Tree sitter not provided");
  }

  createQuery(_languageId: string, _source: string): Query | undefined {
    throw new Error("Tree sitter not provided");
  }
}
