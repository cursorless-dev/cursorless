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
      text = this.isUp ? `${delimiter}${text}` : `${text}${delimiter}`;
      const newRange = this.isUp
        ? new Range(range.end, range.end)
        : new Range(range.start, range.start);
      return {
        editor,
        range: newRange,
        text,
        isReplace: true,
      };
    });
  }

  async run([targets]: [TypedSelection[]]): Promise<ActionReturnValue> {
    const results = flatten(
      await runOnTargetsForEachEditor(targets, async (editor, targets) => {
        const ranges = this.getRanges(editor, targets);
        const edits = this.getEdits(editor, ranges);

        const [editorSelections, copySelections] =
          await performEditsAndUpdateSelections(
            this.graph.rangeUpdater,
            editor,
            edits,
            [
              editor.selections,
              ranges.map(({ range }) => new Selection(range.start, range.end)),
            ]
          );

        editor.selections = editorSelections;
        editor.revealRange(copySelections[0]);

        return {
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

    const thatMark = results.flatMap((result) => result.thatMark);

    return { thatMark };
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
