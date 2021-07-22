import {
  Action,
  ActionPreferences,
  ActionReturnValue,
  Graph,
  TypedSelection,
} from "../Types";
import { Range, TextEditor } from "vscode";
import performDocumentEdits from "../performDocumentEdits";
import displayPendingEditDecorations from "../editDisplayUtils";
import { runOnTargetsForEachEditor } from "../targetUtils";
import { flatten } from "lodash";
import unifyRanges from "../unifyRanges";

class CopyLines implements Action {
  targetPreferences: ActionPreferences[] = [{ insideOutsideType: "inside" }];

  constructor(private graph: Graph, private isUp: boolean) {
    this.run = this.run.bind(this);
  }

  private getRanges(editor: TextEditor, targets: TypedSelection[]) {
    const ranges = targets.map((target) => {
      const selection = target.selection.selection;
      const start = selection.start.with({ character: 0 });
      const end = editor.document.lineAt(selection.end).range.end;
      return new Range(start, end);
    });
    return unifyRanges(ranges);
  }

  private getEdits(editor: TextEditor, ranges: Range[]) {
    return ranges.map((range) => {
      let newText = editor.document.getText(range);
      newText = this.isUp ? `${newText}\n` : `\n${newText}`;
      const newRange = this.isUp
        ? new Range(range.start, range.start)
        : new Range(range.end, range.end);
      return {
        editor,
        range: newRange,
        newText,
      };
    });
  }

  async run([targets]: [TypedSelection[]]): Promise<ActionReturnValue> {
    await displayPendingEditDecorations(
      targets,
      this.graph.editStyles.referenced,
      this.graph.editStyles.referencedLine
    );

    runOnTargetsForEachEditor(targets, async (editor, targets) => {
      const ranges = this.getRanges(editor, targets);
      const edits = this.getEdits(editor, ranges);

      await performDocumentEdits(editor, edits);
    });

    return { returnValue: null, thatMark: [] };
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
