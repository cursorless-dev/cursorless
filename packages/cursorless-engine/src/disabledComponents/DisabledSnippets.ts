import type { SnippetMap, Snippet, TextEditor } from "@cursorless/common";
import type { Snippets } from "../core/Snippets";

export class DisabledSnippets implements Snippets {
  updateUserSnippets(): Promise<void> {
    throw new Error("Snippets are not implemented.");
  }

  registerThirdPartySnippets(
    _extensionId: string,
    _snippets: SnippetMap,
  ): void {
    throw new Error("Snippets are not implemented.");
  }

  getSnippetStrict(_snippetName: string): Snippet {
    throw new Error("Snippets are not implemented.");
  }

  openNewSnippetFile(
    _dirPath: string,
    _snippetName: string,
  ): Promise<TextEditor> {
    throw new Error("Snippets are not implemented.");
  }
}
