import type { TextDocument, Range, Listener } from "@cursorless/common";
import type { SyntaxNode } from "web-tree-sitter";
import type { LanguageDefinition } from "../languages/LanguageDefinition";
import type { LanguageDefinitions } from "../languages/LanguageDefinitions";

export class DisabledLanguageDefinitions implements LanguageDefinitions {
  init(): Promise<void> {
    return Promise.resolve();
  }

  onDidChangeDefinition(_listener: Listener) {
    return { dispose: () => {} };
  }

  loadLanguage(_languageId: string): Promise<void> {
    return Promise.resolve();
  }

  get(_languageId: string): LanguageDefinition | undefined {
    return undefined;
  }

  getNodeAtLocation(
    _document: TextDocument,
    _range: Range,
  ): SyntaxNode | undefined {
    return undefined;
  }

  dispose(): void {
    // Do nothing
  }
}
