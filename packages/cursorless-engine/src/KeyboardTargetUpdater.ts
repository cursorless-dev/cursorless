import type { Disposable, IDE } from "@cursorless/common";
import type { StoredTargetMap } from "./core/StoredTargets";
import { CursorStage } from "./processTargets/marks/CursorStage";
import { DecorationDebouncer } from "./util/DecorationDebouncer";

export class KeyboardTargetUpdater {
  private disposables: Disposable[] = [];
  private selectionWatcherDisposable: Disposable | undefined;
  private debouncer: DecorationDebouncer;

  constructor(
    private ide: IDE,
    private storedTargets: StoredTargetMap,
  ) {
    this.debouncer = new DecorationDebouncer(ide.configuration, () =>
      this.updateKeyboardTarget(),
    );

    this.disposables.push(
      ide.configuration.onDidChangeConfiguration(() => this.maybeActivate()),

      this.debouncer,
    );

    this.maybeActivate();
  }

  maybeActivate(): void {
    const isActive = this.ide.configuration.getOwnConfiguration(
      "experimental.keyboardTargetFollowsSelection",
    );

    if (isActive) {
      if (this.selectionWatcherDisposable == null) {
        this.selectionWatcherDisposable =
          this.ide.onDidChangeTextEditorSelection(this.debouncer.run);
      }

      return;
    }

    if (this.selectionWatcherDisposable != null) {
      this.selectionWatcherDisposable.dispose();
      this.selectionWatcherDisposable = undefined;
    }
  }

  private updateKeyboardTarget() {
    const activeEditor = this.ide.activeTextEditor;

    if (activeEditor == null || this.storedTargets.get("keyboard") == null) {
      return;
    }

    this.storedTargets.set("keyboard", new CursorStage().run());
  }

  dispose() {
    this.disposables.forEach((disposable) => disposable.dispose());
    this.selectionWatcherDisposable?.dispose();
  }
}
