import { EditableTextEditor } from "@cursorless/common";
import { callFunctionAndUpdateRanges } from "../../core/updateSelections/updateSelections";
import { Graph } from "../../typings/Graph";
import { EditTarget, State } from "./EditNew.types";

/**
 * Handle targets that will use a VSCode command to insert a new target, eg
 * `editor.action.insertLineAfter`, and return an updated state object.
 *
 * We proceed by moving cursor to given targets, and then performing the
 * command.
 * @param graph The graph object
 * @param editor The editor on which we're operating
 * @param state The state object tracking cursors, thatMark, etc
 * @returns An updated `state` object
 */
export async function runInsertLineAfterTargets(
  graph: Graph,
  editor: EditableTextEditor,
  state: State,
): Promise<State> {
  const targets: EditTarget[] = state.targets
    .map((target, index) => {
      const actionType = target.getEditNewActionType();
      if (actionType === "insertLineAfter") {
        return {
          target,
          index,
        };
      }
    })
    .filter((target): target is EditTarget => !!target);

  if (targets.length === 0) {
    return state;
  }

  const contentRanges = targets.map(({ target }) => target.contentRange);

  const [updatedTargetRanges, updatedThatRanges] =
    await callFunctionAndUpdateRanges(
      graph.rangeUpdater,
      () => editor.insertLineAfter(contentRanges),
      editor.document,
      [state.targets.map(({ contentRange }) => contentRange), state.thatRanges],
    );

  // For each of the given command targets, the cursor will go where it ended
  // up after running the command.  We add it to the state so that any
  // potential edit targets can update them after we return from this function.
  const cursorRanges = [...state.cursorRanges];
  targets.forEach((commandTarget, index) => {
    cursorRanges[commandTarget.index] = editor.selections[index];
  });

  return {
    targets: state.targets.map((target, index) =>
      target.withContentRange(updatedTargetRanges[index]),
    ),
    thatRanges: updatedThatRanges,
    cursorRanges,
  };
}
