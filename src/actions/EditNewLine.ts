import { commands, Range, TextEditor } from "vscode";
import { Target } from "../typings/target.types";
import { Graph } from "../typings/Types";
import { getNotebookFromCellDocument } from "../util/notebook";
import { Action, ActionReturnValue } from "./actions.types";

class EditNewLine implements Action {
  constructor(private graph: Graph, private isAbove: boolean) {
    this.run = this.run.bind(this);
  }

  private correctForParagraph(targets: Target[]) {
    targets.forEach((target) => {
      let { start, end } = target.contentRange;
      if (target.scopeType === "paragraph") {
        if (this.isAbove && target.leadingDelimiterRange != null) {
          start = start.translate({ lineDelta: -1 });
        } else if (!this.isAbove && target.trailingDelimiterRange != null) {
          end = end.translate({ lineDelta: 1 });
        }
        target.contentRange = new Range(start, end);
      }
    });
  }

  private isNotebookEditor(editor: TextEditor) {
    return getNotebookFromCellDocument(editor.document) != null;
  }

  private getCommand(target: Target) {
    if (target.scopeType === "notebookCell") {
      if (this.isNotebookEditor(target.editor)) {
        return this.isAbove
          ? "notebook.cell.insertCodeCellAbove"
          : "notebook.cell.insertCodeCellBelow";
      }
      return this.isAbove
        ? "jupyter.insertCellAbove"
        : "jupyter.insertCellBelow";
    }
    return this.isAbove
      ? "editor.action.insertLineBefore"
      : "editor.action.insertLineAfter";
  }

  async run([targets]: [Target[]]): Promise<ActionReturnValue> {
    this.correctForParagraph(targets);

    if (this.isAbove) {
      await this.graph.actions.setSelectionBefore.run([targets]);
    } else {
      await this.graph.actions.setSelectionAfter.run([targets]);
    }

    const command = this.getCommand(targets[0]);
    await commands.executeCommand(command);

    return {
      thatMark: targets.map((target) => ({
        selection: target.editor.selection,
        editor: target.editor,
      })),
    };
  }
}

export class EditNewLineAbove extends EditNewLine {
  constructor(graph: Graph) {
    super(graph, true);
  }
}

export class EditNewLineBelow extends EditNewLine {
  constructor(graph: Graph) {
    super(graph, false);
  }
}
