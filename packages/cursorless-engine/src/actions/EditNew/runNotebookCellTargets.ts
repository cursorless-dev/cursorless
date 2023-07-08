import { Selection } from "@cursorless/common";
import { NotebookCellPositionTarget } from "../../processTargets/targets";
import { ide } from "../../singletons/ide.singleton";
import { Target } from "../../typings/target.types";
import { createThatMark, ensureSingleTarget } from "../../util/targetUtils";
import { Actions } from "../Actions";
import { ActionReturnValue } from "../actions.types";

export async function runEditNewNotebookCellTargets(
  actions: Actions,
  targets: Target[],
): Promise<ActionReturnValue> {
  // Can only run on one target because otherwise we'd end up with cursors in
  // multiple cells, which is unsupported in VSCode
  const target = ensureSingleTarget(targets) as NotebookCellPositionTarget;
  const editor = ide().getEditableTextEditor(target.editor);
  const isAbove = target.insertionMode === "before";

  await actions.setSelection.run([targets]);

  let modifyThatMark = (selection: Selection) => selection;
  if (isAbove) {
    modifyThatMark = await editor.editNewNotebookCellAbove();
  } else {
    await editor.editNewNotebookCellBelow();
  }

  const thatMark = createThatMark([target.thatTarget]);

  // Apply horrible hack to work around the fact that in vscode the promise
  // resolves before the edits have actually been performed.
  thatMark[0].selection = modifyThatMark(thatMark[0].selection);

  return { thatSelections: thatMark };
}
