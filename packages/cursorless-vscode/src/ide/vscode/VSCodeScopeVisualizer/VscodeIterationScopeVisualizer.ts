import type { Disposable, TextEditor } from "@cursorless/common";
import { toCharacterRange } from "@cursorless/common";
import type { VscodeTextEditorImpl } from "../VscodeTextEditorImpl";
import { VscodeScopeVisualizer } from "./VscodeScopeVisualizer";
import type { ScopeSupport } from "@cursorless/cursorless-engine";

export class VscodeIterationScopeVisualizer extends VscodeScopeVisualizer {
  protected getScopeSupport(editor: TextEditor): ScopeSupport {
    return this.scopeProvider.getIterationScopeSupport(editor, this.scopeType);
  }

  protected registerListener(): Disposable {
    return this.scopeProvider.onDidChangeIterationScopeRanges(
      (editor, iterationScopeRanges) => {
        this.renderer.setScopes(
          editor as VscodeTextEditorImpl,
          iterationScopeRanges.map(({ domain, ranges }) => ({
            domain: toCharacterRange(domain),
            nestedRanges: ranges.map(({ range }) => toCharacterRange(range)),
          })),
        );
      },
      {
        scopeType: this.scopeType,
        visibleOnly: true,
        includeNestedTargets: false,
      },
    );
  }

  protected getNestedScopeRangeType() {
    return "iteration" as const;
  }
}
