import { flatten } from "lodash";
import { Range, Selection, TextEditor } from "vscode";
import { performEditsAndUpdateSelections } from "../core/updateSelections/updateSelections";
import { Target } from "../typings/target.types";
import { Graph } from "../typings/Types";
import { displayPendingEditDecorationsForRanges } from "../util/editDisplayUtils";
import { runOnTargetsForEachEditor } from "../util/targetUtils";
import unifyRanges from "../util/unifyRanges";
import { Action, ActionReturnValue } from "./actions.types";

class CopyLines implements Action {
  constructor(private graph: Graph, private isUp: boolean) {
    this.run = this.run.bind(this);
  }

  private getRanges(editor: TextEditor, targets: Target[]) {
    const paragraphTargets = targets.filter((target) => target.isParagraph);
    const ranges = targets.map((target) =>
      expandToContainingLine(editor, target.contentRange)
    );
    const unifiedRanges = unifyRanges(ranges);
    return unifiedRanges.map((range) => ({
      range,
      isParagraph:
        paragraphTargets.find((target) => target.contentRange.isEqual(range)) !=
        null,
    }));
  }

  private getEdits(
    editor: TextEditor,
    ranges: { range: Range; isParagraph: boolean }[]
  ) {
    return ranges.map(({ range, isParagraph }) => {
      const delimiter = isParagraph ? "\n\n" : "\n";
      let text = editor.document.getText(range);
      const length = text.length;
      text = this.isUp ? `${delimiter}${text}` : `${text}${delimiter}`;
      const newRange = this.isUp
        ? new Range(range.end, range.end)
        : new Range(range.start, range.start);
      return {
        edit: {
          editor,
          range: newRange,
          text,
          isReplace: this.isUp,
        },
        offset: delimiter.length,
        length,
      };
    });
  }

  async run([targets]: [Target[]]): Promise<ActionReturnValue> {
    const results = flatten(
      await runOnTargetsForEachEditor(targets, async (editor, targets) => {
        const ranges = this.getRanges(editor, targets);
        const editWrappers = this.getEdits(editor, ranges);
        const rangeSelections = ranges.map(
          ({ range }) => new Selection(range.start, range.end)
        );

        const [editorSelections, copySelections] =
          await performEditsAndUpdateSelections(
            this.graph.rangeUpdater,
            editor,
            editWrappers.map((wrapper) => wrapper.edit),
            [editor.selections, rangeSelections]
          );

        editor.selections = editorSelections;
        editor.revealRange(copySelections[0]);

        let sourceSelections;
        if (this.isUp) {
          sourceSelections = editWrappers.map((wrapper) => {
            const startIndex =
              editor.document.offsetAt(wrapper.edit.range.start) +
              wrapper.offset;
            const endIndex = startIndex + wrapper.length;
            return new Selection(
              editor.document.positionAt(startIndex),
              editor.document.positionAt(endIndex)
            );
          });
        } else {
          sourceSelections = rangeSelections;
        }

        return {
          sourceMark: sourceSelections.map((selection) => ({
            editor,
            selection,
          })),
          thatMark: copySelections.map((selection) => ({
            editor,
            selection,
          })),
        };
      })
    );

    await displayPendingEditDecorationsForRanges(
      results.flatMap((result) =>
        result.thatMark.map((that) => ({
          editor: that.editor,
          range: that.selection,
        }))
      ),
      this.graph.editStyles.justAdded.token
    );

    const sourceMark = results.flatMap((result) => result.sourceMark);
    const thatMark = results.flatMap((result) => result.thatMark);

    return { sourceMark, thatMark };
  }
}

export class CopyLinesUp extends CopyLines {
  constructor(graph: Graph) {
    super(graph, true);
  }
}

export class CopyLinesDown extends CopyLines {
  constructor(graph: Graph) {
    super(graph, false);
  }
}

function expandToContainingLine(editor: TextEditor, range: Range) {
  const start = range.start.with({ character: 0 });
  const end = editor.document.lineAt(range.end).range.end;
  return new Range(start, end);
}
