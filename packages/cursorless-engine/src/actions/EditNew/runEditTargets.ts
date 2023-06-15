import {
  EditableTextEditor,
  RangeExpansionBehavior,
  Selection,
} from "@cursorless/common";
import { zip } from "lodash";
import { RangeUpdater } from "../../core/updateSelections/RangeUpdater";
import { performEditsAndUpdateSelectionsWithBehavior } from "../../core/updateSelections/updateSelections";
import { EditTarget, State } from "./EditNew.types";

/**
 * Handle targets that will use an edit action to insert a new target, and
 * return an updated state object.
 *
 * We proceed by asking the targets to construct an edit where we insert an
 * empty string, and then we place the cursor where that empty string would be.
 * This will cause the targets to delete themselves, or insert a delimiter if
 * they are positional.
 * @param graph The graph object
 * @param editor The editor on which we're operating
 * @param state The state object tracking cursors, thatMark, etc
 * @returns An updated `state` object
 */
export async function runEditTargets(
  rangeUpdater: RangeUpdater,
  editor: EditableTextEditor,
  state: State,
): Promise<State> {
  const targets: EditTarget[] = state.targets
    .map((target, index) => {
      const actionType = target.getEditNewActionType();
      if (actionType === "edit") {
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

  const edits = targets.map((target) => target.target.constructChangeEdit(""));

  const thatSelections = {
    selections: state.thatRanges.map((r) => r.toSelection(false)),
  };

  // We need to remove undefined cursor locations.  Note that these undefined
  // locations will be the locations where our edit targets will go.  The only
  // cursor positions defined at this point will have come from command targets
  // before.
  const cursorInfos = state.cursorRanges
    .map((range, index) => ({ range, index }))
    .filter(({ range }) => range != null);

  const cursorIndices = cursorInfos.map(({ index }) => index);

  const cursorSelections = {
    selections: cursorInfos.map(({ range }) => range!.toSelection(false)),
  };

  const editSelections = {
    selections: edits.map((edit) => edit.range.toSelection(false)),
    rangeBehavior: RangeExpansionBehavior.openOpen,
  };

  const [
    updatedThatSelections,
    updatedCursorSelections,
    updatedEditSelections,
  ]: Selection[][] = await performEditsAndUpdateSelectionsWithBehavior(
    rangeUpdater,
    editor,
    edits,
    [thatSelections, cursorSelections, editSelections],
  );

  const updatedCursorRanges = [...state.cursorRanges];

  // Update the cursor positions for the command targets
  zip(cursorIndices, updatedCursorSelections).forEach(([index, selection]) => {
    updatedCursorRanges[index!] = selection;
  });

  // Add cursor positions for our edit targets.
  targets.forEach((delimiterTarget, index) => {
    const edit = edits[index];
    const range = edit.updateRange(updatedEditSelections[index]);
    updatedCursorRanges[delimiterTarget.index] = range;
  });

  return {
    targets: state.targets,
    thatRanges: updatedThatSelections,
    cursorRanges: updatedCursorRanges,
  };
}
