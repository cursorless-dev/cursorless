import type { Snippet, TextEditor } from "@cursorless/common";
import type { Snippets } from "../core/Snippets";

export class DisabledSnippets implements Snippets {
  getSnippetStrict(_snippetName: string): Snippet {
    throw new Error("Snippets are not implemented.");
  }

  openNewSnippetFile(
    _snippetName: string,
    _directory: string,
  ): Promise<TextEditor> {
    throw new Error("Snippets are not implemented.");
  }
}
