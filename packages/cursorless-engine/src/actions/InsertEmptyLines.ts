import { FlashStyle, Range, Selection, toLineRange } from "@cursorless/common";
import { flatten } from "lodash";
import { RangeUpdater } from "../core/updateSelections/RangeUpdater";
import { performEditsAndUpdateSelections } from "../core/updateSelections/updateSelections";
import { ide } from "../singletons/ide.singleton";
import { Target } from "../typings/target.types";
import { setSelectionsWithoutFocusingEditor } from "../util/setSelectionsAndFocusEditor";
import { runOnTargetsForEachEditor } from "../util/targetUtils";
import { Action, ActionReturnValue } from "./actions.types";

class InsertEmptyLines implements Action {
  constructor(
    private rangeUpdater: RangeUpdater,
    private insertAbove: boolean,
    private insertBelow: boolean,
  ) {
    this.run = this.run.bind(this);
  }

  private getRanges(targets: Target[]) {
    let lines = targets.flatMap((target) => {
      const lines: number[] = [];
      if (this.insertAbove) {
        lines.push(target.contentRange.start.line);
      }
      if (this.insertBelow) {
        lines.push(target.contentRange.end.line + 1);
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

  async run([targets]: [Target[]]): Promise<ActionReturnValue> {
    const results = flatten(
      await runOnTargetsForEachEditor(targets, async (editor, targets) => {
        const ranges = this.getRanges(targets);
        const edits = this.getEdits(ranges);

        const editableEditor = ide().getEditableTextEditor(editor);

        const [updatedThatSelections, lineSelections, updatedCursorSelections] =
          await performEditsAndUpdateSelections(
            this.rangeUpdater,
            editableEditor,
            edits,
            [
              targets.map((target) => target.thatTarget.contentSelection),
              ranges.map((range) => new Selection(range.start, range.end)),
              editor.selections,
            ],
          );

        setSelectionsWithoutFocusingEditor(
          editableEditor,
          updatedCursorSelections,
        );

        return {
          thatMark: updatedThatSelections.map((selection) => ({
            editor,
            selection,
          })),
          lineSelections: lineSelections.map((selection, index) => ({
            editor,
            range:
              ranges[index].start.line < editor.document.lineCount - 1
                ? new Range(
                    selection.start.translate(-1, undefined),
                    selection.end.translate(-1, undefined),
                  )
                : selection,
          })),
        };
      }),
    );

    await ide().flashRanges(
      results.flatMap((result) =>
        result.lineSelections.map(({ editor, range }) => ({
          editor,
          range: toLineRange(range),
          style: FlashStyle.justAdded,
        })),
      ),
    );

    const thatMark = results.flatMap((result) => result.thatMark);

    return { thatSelections: thatMark };
  }
}

export class InsertEmptyLinesAround extends InsertEmptyLines {
  constructor(rangeUpdater: RangeUpdater) {
    super(rangeUpdater, true, true);
  }
}

export class InsertEmptyLineAbove extends InsertEmptyLines {
  constructor(rangeUpdater: RangeUpdater) {
    super(rangeUpdater, true, false);
  }
}

export class InsertEmptyLineBelow extends InsertEmptyLines {
  constructor(rangeUpdater: RangeUpdater) {
    super(rangeUpdater, false, true);
  }
}
