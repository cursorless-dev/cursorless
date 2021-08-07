import {
  Action,
  ActionPreferences,
  ActionReturnValue,
  Graph,
  TypedSelection,
} from "../Types";
import { Selection, Range } from "vscode";
import { displayPendingEditDecorationsForSelection } from "../editDisplayUtils";
import { runOnTargetsForEachEditor } from "../targetUtils";
import { performEditsAndUpdateSelections } from "../updateSelections";
import { flatten } from "lodash";

class InsertEmptyLines implements Action {
  targetPreferences: ActionPreferences[] = [{ insideOutsideType: "inside" }];

  constructor(
    private graph: Graph,
    private insertAbove: boolean,
    private insertBelow: boolean
  ) {
    this.run = this.run.bind(this);
  }

  private getRanges(targets: TypedSelection[]) {
    let lines = targets.flatMap((target) => {
      const lines = [];
      if (this.insertAbove) {
        lines.push(target.selection.selection.start.line);
      }
      if (this.insertBelow) {
        lines.push(target.selection.selection.end.line + 1);
      }
      return lines;
    });
    // Remove duplicates
    lines = [...new Set(lines)];

    return lines.map((line) => new Range(line, 0, line, 0));
  }

  private getEdits(ranges: Range[]) {
    return ranges.map((range) => ({
      range,
      text: "\n",
    }));
  }

  async run([targets]: [TypedSelection[]]): Promise<ActionReturnValue> {
    const results = flatten(
      await runOnTargetsForEachEditor(targets, async (editor, targets) => {
        const ranges = this.getRanges(targets);
        const edits = this.getEdits(ranges);

        const [updatedSelections, lineSelections, updatedOriginalSelections] =
          await performEditsAndUpdateSelections(editor, edits, [
            targets.map((target) => target.selection.selection),
            ranges.map((range) => new Selection(range.start, range.end)),
            editor.selections,
          ]);

        editor.selections = updatedOriginalSelections;

        return {
          thatMark: updatedSelections.map((selection) => ({
            editor,
            selection,
          })),
          lineSelections: lineSelections.map((selection, index) => ({
            editor,
            selection:
              ranges[index].start.line < editor.document.lineCount - 1
                ? new Selection(
                    selection.start.translate({ lineDelta: -1 }),
                    selection.end.translate({ lineDelta: -1 })
                  )
                : selection,
          })),
        };
      })
    );

    await displayPendingEditDecorationsForSelection(
      results.flatMap((result) => result.lineSelections),
      this.graph.editStyles.justAdded.line
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
