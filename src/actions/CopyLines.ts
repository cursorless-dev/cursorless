import {
  Action,
  ActionPreferences,
  ActionReturnValue,
  Graph,
  TypedSelection,
} from "../typings/Types";
import { Range, Selection, TextEditor } from "vscode";
import { displayPendingEditDecorationsForSelection } from "../util/editDisplayUtils";
import { runOnTargetsForEachEditor } from "../util/targetUtils";
import { flatten } from "lodash";
import unifyRanges from "../util/unifyRanges";
import expandToContainingLine from "../util/expandToContainingLine";
import { performEditsAndUpdateSelections } from "../core/updateSelections/updateSelections";

class CopyLines implements Action {
  getTargetPreferences: () => ActionPreferences[] = () => [
    { insideOutsideType: "inside" },
  ];

  constructor(private graph: Graph, private isUp: boolean) {
    this.run = this.run.bind(this);
  }

  private getRanges(editor: TextEditor, targets: TypedSelection[]) {
    const paragraphTargets = targets.filter(
      (target) => target.selectionType === "paragraph"
    );
    const ranges = targets.map((target) =>
      expandToContainingLine(editor, target.selection.selection)
    );
    const unifiedRanges = unifyRanges(ranges);
    return unifiedRanges.map((range) => ({
      range,
      isParagraph:
        paragraphTargets.find((target) =>
          target.selection.selection.isEqual(range)
        ) != null,
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

  async run([targets]: [TypedSelection[]]): Promise<ActionReturnValue> {
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

    await displayPendingEditDecorationsForSelection(
      results.flatMap((result) => result.thatMark),
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
