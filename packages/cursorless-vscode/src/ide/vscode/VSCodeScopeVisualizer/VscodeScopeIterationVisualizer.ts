import { Disposable, TextEditor } from "@cursorless/common";
import { VscodeTextEditorImpl } from "../VscodeTextEditorImpl";
import { VscodeScopeVisualizer } from "./VscodeScopeVisualizer";
import { ScopeSupport } from "@cursorless/cursorless-engine";

export class VscodeScopeIterationVisualizer extends VscodeScopeVisualizer {
  protected getScopeSupport(editor: TextEditor): ScopeSupport {
    return this.scopeProvider.getIterationScopeSupport(editor, this.scopeType);
  }

  protected registerListener(): Disposable {
    return this.scopeProvider.onDidChangeIterationScopeRanges(
      (editor, iterationScopeRanges) => {
        this.renderer.setScopes(
          editor as VscodeTextEditorImpl,
          iterationScopeRanges!.map(({ domain, ranges }) => ({
            domain,
            nestedRanges: ranges.map(({ range }) => range),
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
