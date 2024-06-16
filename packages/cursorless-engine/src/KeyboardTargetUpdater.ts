import { Disposable } from "@cursorless/common";
import { StoredTargetMap } from "./core/StoredTargets";
import { ide } from "./singletons/ide.singleton";
import { Debouncer } from "./core/Debouncer";
import { PlainTarget } from "./processTargets/targets";

export class KeyboardTargetUpdater {
  private disposables: Disposable[] = [];

  constructor(private storedTargets: StoredTargetMap) {
    const debouncer = new Debouncer(() => this.updateKeyboardTarget());

    this.disposables.push(
      // An Event which fires when the selection in an editor has changed.
      ide().onDidChangeTextEditorSelection(debouncer.run),

      debouncer,
    );
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
  }
}
