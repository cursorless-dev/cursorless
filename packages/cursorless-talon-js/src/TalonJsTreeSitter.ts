import {
  Range,
  TextDocument,
  UnsupportedLanguageError,
} from "@cursorless/common";
import { TreeSitter } from "@cursorless/cursorless-engine";
import type { Language, SyntaxNode, Tree } from "web-tree-sitter";

export class TalonJsTreeSitter implements TreeSitter {
  getNodeAtLocation(document: TextDocument, _range: Range): SyntaxNode {
    throw new UnsupportedLanguageError(document.languageId);
  }

  getTree(document: TextDocument): Tree {
    throw new UnsupportedLanguageError(document.languageId);
  }

  loadLanguage(_languageId: string): Promise<boolean> {
    return Promise.resolve(false);
  }

  getLanguage(_languageId: string): Language | undefined {
    return undefined;
  }
}
