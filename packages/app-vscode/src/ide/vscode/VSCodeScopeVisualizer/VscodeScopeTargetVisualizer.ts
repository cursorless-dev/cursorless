import type {
  Disposable,
  GeneralizedRange,
  ScopeSupport,
  TargetRanges,
  TextEditor,
} from "@cursorless/lib-common";
import { toCharacterRange } from "@cursorless/lib-common";
import { VscodeScopeVisualizer } from "./VscodeScopeVisualizer";
import type { VscodeTextEditor } from "../VscodeTextEditor";

abstract class VscodeScopeTargetVisualizer extends VscodeScopeVisualizer {
  protected abstract getTargetRange(
    targetRanges: TargetRanges,
  ): GeneralizedRange;

  protected getScopeSupport(editor: TextEditor): ScopeSupport {
    return this.scopeProvider.getScopeSupport(editor, this.scopeType);
  }

  protected registerListener(): Disposable {
    return this.scopeProvider.onDidChangeScopeRanges(
      (editor, scopeRanges) => {
        this.renderer.setScopes(
          editor as VscodeTextEditor,
          scopeRanges.map(({ domain, targets }) => ({
            domain: toCharacterRange(domain),
            nestedRanges: targets.map((target) => this.getTargetRange(target)),
          })),
        );
      },
      { scopeType: this.scopeType, visibleOnly: true },
    );
  }
}

export class VscodeScopeContentVisualizer extends VscodeScopeTargetVisualizer {
  protected getTargetRange({ contentRange }: TargetRanges): GeneralizedRange {
    return toCharacterRange(contentRange);
  }

  protected getNestedScopeRangeType() {
    return "content" as const;
  }
}

export class VscodeScopeRemovalVisualizer extends VscodeScopeTargetVisualizer {
  protected getTargetRange({
    removalHighlightRange,
  }: TargetRanges): GeneralizedRange {
    return removalHighlightRange;
  }

  protected getNestedScopeRangeType() {
    return "removal" as const;
  }
}
