import { ide } from "../../singletons/ide.singleton";
import type { Destination } from "../../typings/target.types";
import { createThatMark, ensureSingleTarget } from "../../util/targetUtils";
import type { Actions } from "../Actions";
import type { ActionReturnValue } from "../actions.types";

export async function runEditNewNotebookCellTargets(
  actions: Actions,
  destinations: Destination[],
): Promise<ActionReturnValue> {
  // Can only run on one target because otherwise we'd end up with cursors in
  // multiple cells, which is unsupported in VSCode
  const destination = ensureSingleTarget(destinations);
  const editor = ide().getEditableTextEditor(destination.editor);
  const isAbove = destination.insertionMode === "before";

  if (destination.insertionMode === "to") {
    throw Error(
      `Unsupported insertion mode '${destination.insertionMode}' for notebookcapell`,
    );
  }

  await actions.setSelection.run([destination.target]);

  if (isAbove) {
    await editor.editNewNotebookCellAbove();
  } else {
    await editor.editNewNotebookCellBelow();
  }

  const thatMark = createThatMark([destination.target.thatTarget]);

  return { thatSelections: thatMark };
}
