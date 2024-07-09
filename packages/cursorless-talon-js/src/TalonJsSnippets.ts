import type { SnippetMap, Snippet } from "@cursorless/common";
import type { Snippets } from "@cursorless/cursorless-engine";

export class TalonJsSnippets implements Snippets {
  updateUserSnippets(): Promise<void> {
    throw new Error("updateUserSnippets not implemented.");
  }

  registerThirdPartySnippets(
    _extensionId: string,
    _snippets: SnippetMap,
  ): void {
    throw new Error("registerThirdPartySnippets not implemented.");
  }

  getSnippetStrict(_snippetName: string): Snippet {
    throw new Error("getSnippetStrict not implemented.");
  }
}
