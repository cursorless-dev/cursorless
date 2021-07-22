import {
  Action,
  ActionPreferences,
  ActionReturnValue,
  Graph,
  TypedSelection,
} from "../Types";
import performDocumentEdits from "../performDocumentEdits";
import displayPendingEditDecorations from "../editDisplayUtils";
import { runOnTargetsForEachEditor } from "../targetUtils";
import { flatten } from "lodash";
import { Range, Position } from "vscode";

class CopyLines implements Action {
  targetPreferences: ActionPreferences[] = [{ insideOutsideType: "inside" }];

  constructor(private graph: Graph, private isUp: boolean) {
    this.run = this.run.bind(this);
  }

  async run([targets]: [TypedSelection[]]): Promise<ActionReturnValue> {
    await displayPendingEditDecorations(
      targets,
      this.graph.editStyles.referenced,
      this.graph.editStyles.referencedLine
    );

    runOnTargetsForEachEditor(targets, async (editor, targets) => {
      const edits = targets.map((target) => {
        const selection = target.selection.selection;
        const start = new Position(selection.start.line, 0);
        const end = editor.document.lineAt(selection.end.line).range.end;
        let newText = editor.document.getText(new Range(start, end));
        newText = this.isUp ? `${newText}\n` : `\n${newText}`;
        const newRange = this.isUp
          ? new Range(start, start)
          : new Range(end, end);
        return {
          editor,
          range: newRange,
          newText,
        };
      });

      await performDocumentEdits(editor, edits);
    });

    return { returnValue: null, thatMark: [] };
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
