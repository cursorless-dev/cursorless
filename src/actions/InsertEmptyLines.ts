import { flatten, zip } from "lodash";
import { DecorationRangeBehavior, Selection } from "vscode";
import { performEditsAndUpdateSelectionsWithBehavior } from "../core/updateSelections/updateSelections";
import { toPositionTarget } from "../processTargets/modifiers/PositionStage";
import { toLineTarget } from "../processTargets/modifiers/scopeTypeStages/LineStage";
import { Target } from "../typings/target.types";
import { EditWithRangeUpdater, Graph } from "../typings/Types";
import { setSelectionsWithoutFocusingEditor } from "../util/setSelectionsAndFocusEditor";
import { runOnTargetsForEachEditor } from "../util/targetUtils";
import { Action, ActionReturnValue } from "./actions.types";

class InsertEmptyLines implements Action {
  constructor(
    private graph: Graph,
    private insertAbove: boolean,
    private insertBelow: boolean
  ) {
    this.run = this.run.bind(this);
  }

  private getEdits(targets: Target[]) {
    return targets.flatMap((target) => {
      const lineTarget = toLineTarget(target);
      const edits: EditWithRangeUpdater[] = [];
      if (this.insertAbove) {
        edits.push(
          toPositionTarget(lineTarget, "before").constructEmptyChangeEdit()
        );
      }
      if (this.insertBelow) {
        edits.push(
          toPositionTarget(lineTarget, "after").constructEmptyChangeEdit()
        );
      }
      return edits;
    });
  }

  async run([targets]: [Target[]]): Promise<ActionReturnValue> {
    const results = flatten(
      await runOnTargetsForEachEditor(targets, async (editor, targets) => {
        const edits = this.getEdits(targets);

        const cursorSelections = { selections: editor.selections };
        const contentSelections = {
          selections: targets.map(
            (target) => target.thatTarget.contentSelection
          ),
        };
        const editSelections = {
          selections: edits.map(
            ({ range }) => new Selection(range.start, range.end)
          ),
          rangeBehavior: DecorationRangeBehavior.OpenOpen,
        };

        const [
          updatedCursorSelections,
          updatedContentSelections,
          updatedEditSelections,
        ]: Selection[][] = await performEditsAndUpdateSelectionsWithBehavior(
          this.graph.rangeUpdater,
          editor,
          edits,
          [cursorSelections, contentSelections, editSelections]
        );

        const insertionRanges = zip(edits, updatedEditSelections).map(
          ([edit, selection]) => edit!.updateRange(selection!)
        );

        setSelectionsWithoutFocusingEditor(editor, updatedCursorSelections);

        return {
          thatMark: updatedContentSelections.map((selection) => ({
            editor,
            selection,
          })),
          lineSelections: insertionRanges.map((range) => ({
            editor,
            range,
          })),
        };
      })
    );

    await this.graph.editStyles.displayPendingEditDecorationsForRanges(
      results.flatMap((result) => result.lineSelections),
      this.graph.editStyles.justAdded,
      false
    );

    const thatMark = results.flatMap((result) => result.thatMark);

    return { thatMark };
  }
}

export class InsertEmptyLinesAround extends InsertEmptyLines {
  constructor(graph: Graph) {
    super(graph, true, true);
  }
}

export class InsertEmptyLineAbove extends InsertEmptyLines {
  constructor(graph: Graph) {
    super(graph, true, false);
  }
}

export class InsertEmptyLineBelow extends InsertEmptyLines {
  constructor(graph: Graph) {
    super(graph, false, true);
  }
}
