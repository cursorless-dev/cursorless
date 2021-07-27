import {
  Action,
  ActionPreferences,
  ActionReturnValue,
  Graph,
  TypedSelection,
} from "../Types";
import { Range, TextEditor } from "vscode";
import { performEditsAndUpdateSelections } from "../updateSelections";
import displayPendingEditDecorations from "../editDisplayUtils";
import { runOnTargetsForEachEditor } from "../targetUtils";
import { flatten } from "lodash";
import unifyRanges from "../unifyRanges";
import expandToContainingLine from "./expandToContainingLine";

class CopyLines implements Action {
  targetPreferences: ActionPreferences[] = [{ insideOutsideType: "inside" }];

  constructor(private graph: Graph, private isUp: boolean) {
    this.run = this.run.bind(this);
  }

  private getRanges(editor: TextEditor, targets: TypedSelection[]) {
    const ranges = targets.map((target) =>
      expandToContainingLine(editor, target.selection.selection)
    );

    return unifyRanges(ranges);
  }

  private getEdits(editor: TextEditor, ranges: Range[]) {
    return ranges.map((range) => {
      let text = editor.document.getText(range);
      text = this.isUp ? `${text}\n` : `\n${text}`;
      const newRange = this.isUp
        ? new Range(range.start, range.start)
        : new Range(range.end, range.end);
      return {
        editor,
        range: newRange,
        text,
      };
    });
  }

  async run([targets]: [TypedSelection[]]): Promise<ActionReturnValue> {
    await displayPendingEditDecorations(
      targets,
      this.graph.editStyles.referenced
    );

    const thatMark = flatten(
      await runOnTargetsForEachEditor(targets, async (editor, targets) => {
        const ranges = this.getRanges(editor, targets);
        const edits = this.getEdits(editor, ranges);

        const [updatedSelections] = await performEditsAndUpdateSelections(
          editor,
          edits,
          [targets.map((target) => target.selection.selection)]
        );

        editor.revealRange(updatedSelections[0]);

        return updatedSelections.map((selection) => ({
          editor,
          selection,
        }));
      })
    );

    return { returnValue: null, thatMark };
  }
}

export class CopyLinesUp extends CopyLines {
  constructor(graph: Graph) {
    super(graph, false);
  }
}

export class CopyLinesDown extends CopyLines {
  constructor(graph: Graph) {
    super(graph, true);
  }
}
