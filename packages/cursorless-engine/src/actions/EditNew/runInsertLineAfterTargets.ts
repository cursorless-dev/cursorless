import { EditableTextEditor } from "@cursorless/common";
import { RangeUpdater } from "../../core/updateSelections/RangeUpdater";
import { callFunctionAndUpdateRanges } from "../../core/updateSelections/updateSelections";
import { EditDestination, State } from "./EditNew.types";

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
  rangeUpdater: RangeUpdater,
  editor: EditableTextEditor,
  state: State,
): Promise<State> {
  const destinations: EditDestination[] = state.destinations
    .map((destination, index) => {
      const actionType = destination.getEditNewActionType();
      if (actionType === "insertLineAfter") {
        return {
          destination,
          index,
        };
      }
    })
    .filter((destination): destination is EditDestination => !!destination);

  if (destinations.length === 0) {
    return state;
  }

  const contentRanges = destinations.map(
    ({ destination }) => destination.contentRange,
  );

  const [updatedTargetRanges, updatedThatRanges] =
    await callFunctionAndUpdateRanges(
      rangeUpdater,
      () => editor.insertLineAfter(contentRanges),
      editor.document,
      [
        state.destinations.map(({ contentRange }) => contentRange),
        state.thatRanges,
      ],
    );

  // For each of the given command targets, the cursor will go where it ended
  // up after running the command.  We add it to the state so that any
  // potential edit targets can update them after we return from this function.
  const cursorRanges = [...state.cursorRanges];
  destinations.forEach((commandTarget, index) => {
    cursorRanges[commandTarget.index] = editor.selections[index];
  });

  return {
    destinations: state.destinations.map((destination, index) =>
      destination.target
        .withContentRange(updatedTargetRanges[index])
        .toDestination(destination.insertionMode),
    ),
    thatRanges: updatedThatRanges,
    cursorRanges,
  };
}
