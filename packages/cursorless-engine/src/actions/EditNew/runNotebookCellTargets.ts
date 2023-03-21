import { Selection } from "@cursorless/common";
import { ide } from "../../singletons/ide.singleton";
import { NotebookCellPositionTarget } from "../../processTargets/targets";
import { Target } from "../../typings/target.types";
import { Graph } from "../../typings/Graph";
import { createThatMark, ensureSingleTarget } from "../../util/targetUtils";
import { ActionReturnValue } from "../actions.types";

export async function runEditNewNotebookCellTargets(
  graph: Graph,
  targets: Target[],
): Promise<ActionReturnValue> {
  // Can only run on one target because otherwise we'd end up with cursors in
  // multiple cells, which is unsupported in VSCode
  const target = ensureSingleTarget(targets) as NotebookCellPositionTarget;
  const editor = ide().getEditableTextEditor(target.editor);
  const isAbove = target.position === "before";

  await graph.actions.setSelection.run([targets]);

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
