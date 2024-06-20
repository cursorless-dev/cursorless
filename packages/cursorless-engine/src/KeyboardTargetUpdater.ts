import { Disposable } from "@cursorless/common";
import { Debouncer } from "./core/Debouncer";
import { StoredTargetMap } from "./core/StoredTargets";
import { PlainTarget } from "./processTargets/targets";
import { ide } from "./singletons/ide.singleton";

export class KeyboardTargetUpdater {
  private disposables: Disposable[] = [];
  private selectionWatcherDisposable: Disposable | undefined;
  private debouncer: Debouncer;

  constructor(private storedTargets: StoredTargetMap) {
    this.debouncer = new Debouncer(() => this.updateKeyboardTarget());

    this.disposables.push(
      ide().configuration.onDidChangeConfiguration(() => this.maybeActivate()),

      this.debouncer,
    );

    this.maybeActivate();
  }

  maybeActivate(): void {
    const isActive = ide().configuration.getOwnConfiguration(
      "experimental.keyboardTargetFollowsSelection",
    );

    if (isActive) {
      if (this.selectionWatcherDisposable == null) {
        this.selectionWatcherDisposable = ide().onDidChangeTextEditorSelection(
          this.debouncer.run,
        );
      }

      return;
    }

    if (this.selectionWatcherDisposable != null) {
      this.selectionWatcherDisposable.dispose();
      this.selectionWatcherDisposable = undefined;
    }
  }

  private updateKeyboardTarget() {
    const activeEditor = ide().activeTextEditor;

    if (activeEditor == null || this.storedTargets.get("keyboard") == null) {
      return;
    }

    this.storedTargets.set(
      "keyboard",
      activeEditor.selections.map(
        (selection) =>
          new PlainTarget({
            contentRange: selection,
            editor: activeEditor,
            isReversed: selection.isReversed,
          }),
      ),
    );
  }

  dispose() {
    this.disposables.forEach((disposable) => disposable.dispose());
    this.selectionWatcherDisposable?.dispose();
  }
}
