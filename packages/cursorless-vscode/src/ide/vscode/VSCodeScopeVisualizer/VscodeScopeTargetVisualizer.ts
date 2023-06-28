import {
  Disposable,
  GeneralizedRange,
  TargetRanges,
  TextEditor,
} from "@cursorless/common";
import { ScopeSupport } from "@cursorless/cursorless-engine";
import { VscodeScopeVisualizer } from ".";
import { VscodeTextEditorImpl } from "../VscodeTextEditorImpl";

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
          editor as VscodeTextEditorImpl,
          scopeRanges!.map(({ domain, targets }) => ({
            domain,
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
    return contentRange;
  }

  protected getNestedColorConfigKey() {
    return "content" as const;
  }
}

export class VscodeScopeRemovalVisualizer extends VscodeScopeTargetVisualizer {
  protected getTargetRange({ removalRange }: TargetRanges): GeneralizedRange {
    return removalRange;
  }

  protected getNestedColorConfigKey() {
    return "removal" as const;
  }
}
