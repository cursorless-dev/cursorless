import { Selection } from "@cursorless/common";
import { ide } from "../../singletons/ide.singleton";
import { Destination } from "../../typings/target.types";
import { createThatMark, ensureSingleTarget } from "../../util/targetUtils";
import { Actions } from "../Actions";
import { ActionReturnValue } from "../actions.types";

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

  let modifyThatMark = (selection: Selection) => selection;
  if (isAbove) {
    modifyThatMark = await editor.editNewNotebookCellAbove();
  } else {
    await editor.editNewNotebookCellBelow();
  }

  const thatMark = createThatMark([destination.target]);

  // Apply horrible hack to work around the fact that in vscode the promise
  // resolves before the edits have actually been performed.
  thatMark[0].selection = modifyThatMark(thatMark[0].selection);

  return { thatSelections: thatMark };
}
