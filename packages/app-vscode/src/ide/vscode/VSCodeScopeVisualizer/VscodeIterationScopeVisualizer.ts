import type {
  Disposable,
  ScopeSupport,
  TextEditor,
} from "@cursorless/lib-common";
import { toCharacterRange } from "@cursorless/lib-common";
import type { VscodeTextEditor } from "../VscodeTextEditor";
import { VscodeScopeVisualizer } from "./VscodeScopeVisualizer";

export class VscodeIterationScopeVisualizer extends VscodeScopeVisualizer {
  protected getScopeSupport(editor: TextEditor): ScopeSupport {
    return this.scopeProvider.getIterationScopeSupport(editor, this.scopeType);
  }

  protected registerListener(): Disposable {
    return this.scopeProvider.onDidChangeIterationScopeRanges(
      (editor, iterationScopeRanges) => {
        this.renderer.setScopes(
          editor as VscodeTextEditor,
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
