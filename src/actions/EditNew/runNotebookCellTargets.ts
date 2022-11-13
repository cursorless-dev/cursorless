import { commands } from "vscode";
import { Selection } from "../../libs/common/ide";
import { NotebookCellPositionTarget } from "../../processTargets/targets";
import { Target } from "../../typings/target.types";
import { Graph } from "../../typings/Types";
import { createThatMark, ensureSingleTarget } from "../../util/targetUtils";
import { ActionReturnValue } from "../actions.types";

export async function runNotebookCellTargets(
  graph: Graph,
  targets: Target[],
): Promise<ActionReturnValue> {
  // Can only run on one target because otherwise we'd end up with cursors in
  // multiple cells, which is unsupported in VSCode
  const target = ensureSingleTarget(targets) as NotebookCellPositionTarget;
  await graph.actions.setSelection.run([targets]);
  const command = target.getEditNewCommand();
  await commands.executeCommand(command);
  const thatMark = createThatMark([target.thatTarget]);

  // Inserting a new jupyter cell above pushes the previous one down two lines
  if (command === "jupyter.insertCellAbove") {
    thatMark[0].selection = new Selection(
      thatMark[0].selection.anchor.translate(2, undefined),
      thatMark[0].selection.active.translate(2, undefined),
    );
  }

  return { thatSelections: thatMark };
}
