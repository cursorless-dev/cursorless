import { zip } from "lodash";
import { DecorationRangeBehavior, Range, Selection, TextEditor } from "vscode";
import { performEditsAndUpdateSelectionsWithBehavior } from "../../core/updateSelections/updateSelections";
import { Graph } from "../../typings/Types";
import { EditTarget, State } from "./EditNew.types";

export async function runEditTargets(
  graph: Graph,
  editor: TextEditor,
  state: State
): Promise<State> {
  const delimiterTargets: EditTarget[] = state.targets
    .map((target, index) => {
      const context = target.getEditNewContext();
      if (context.type === "edit") {
        return {
          target,
          index,
        };
      }
    })
    .filter((target): target is EditTarget => !!target);

  if (delimiterTargets.length === 0) {
    return state;
  }

  const edits = delimiterTargets.map((target) =>
    target.target.constructChangeEdit("")
  );

  const thatSelections = {
    selections: state.thatRanges.map(toSelection),
  };

  const cursorInfos = state.cursorRanges
    .map((range, index) => ({ range, index }))
    .filter(({ range }) => range != null);

  const cursorIndices = cursorInfos.map(({ index }) => index);

  const cursorSelections = {
    selections: cursorInfos.map(({ range }) => toSelection(range!)),
  };

  const editSelections = {
    selections: edits.map((edit) => toSelection(edit.range)),
    rangeBehavior: DecorationRangeBehavior.OpenOpen,
  };

  const [
    updatedThatSelections,
    updatedCursorSelections,
    updatedEditSelections,
  ]: Selection[][] = await performEditsAndUpdateSelectionsWithBehavior(
    graph.rangeUpdater,
    editor,
    edits,
    [thatSelections, cursorSelections, editSelections]
  );

  const updatedCursorRanges = [...state.cursorRanges];

  zip(cursorIndices, updatedCursorSelections).forEach(([index, selection]) => {
    updatedCursorRanges[index!] = selection;
  });

  delimiterTargets.forEach((delimiterTarget, index) => {
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

function toSelection(range: Range) {
  return new Selection(range.start, range.end);
}
