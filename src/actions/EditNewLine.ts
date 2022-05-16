import { commands, Position, Range, Selection, TextEditor } from "vscode";
import { Target } from "../typings/target.types";
import { Graph } from "../typings/Types";
import { getNotebookFromCellDocument } from "../util/notebook";
import { createThatMark, runOnTargetsForEachEditor } from "../util/targetUtils";
import { Action, ActionReturnValue } from "./actions.types";

class EditNewLine implements Action {
  constructor(private graph: Graph, private isAbove: boolean) {
    this.run = this.run.bind(this);
  }

  private isNotebookEditor(editor: TextEditor) {
    return getNotebookFromCellDocument(editor.document) != null;
  }

  private getCommand(target: Target) {
    if (target.isNotebookCell) {
      if (this.isNotebookEditor(target.editor)) {
        return this.isAbove
          ? "notebook.cell.insertCodeCellAbove"
          : "notebook.cell.insertCodeCellBelow";
      }
      return this.isAbove
        ? "jupyter.insertCellAbove"
        : "jupyter.insertCellBelow";
    }
    return null;
  }

  async run([targets]: [Target[]]): Promise<ActionReturnValue> {
    const command = this.getCommand(targets[0]);
    if (command) {
      if (this.isAbove) {
        await this.graph.actions.setSelectionBefore.run([targets]);
      } else {
        await this.graph.actions.setSelectionAfter.run([targets]);
      }
      await commands.executeCommand(command);
      return { thatMark: createThatMark(targets) };
    }

    const thatMark = await runOnTargetsForEachEditor(
      targets,
      async (editor, targets) => {
        const edits = targets.map((target) => {
          const delimiter = target.scopeType === "paragraph" ? "\n\n" : "\n";
          const lineNumber = this.isAbove
            ? target.contentRange.start.line
            : target.contentRange.end.line;
          const line = editor.document.lineAt(lineNumber);
          const { firstNonWhitespaceCharacterIndex } = line;
          const padding = line.text.slice(0, firstNonWhitespaceCharacterIndex);
          const text = this.isAbove ? padding + delimiter : delimiter + padding;
          const position = this.isAbove ? line.range.start : line.range.end;
          const lineDelta = delimiter.length;
          return {
            contentRange: target.contentRange,
            lineDelta,
            firstNonWhitespaceCharacterIndex,
            position,
            text,
          };
        });

        await editor.edit((editBuilder) => {
          edits.forEach((edit) => {
            editBuilder.insert(edit.position, edit.text);
          });
        });

        editor.selections = edits.map((edit) => {
          const selectionLineNum = this.isAbove
            ? edit.position.line
            : edit.position.line + edit.lineDelta;
          const positionSelection = new Position(
            selectionLineNum,
            edit.firstNonWhitespaceCharacterIndex
          );
          return new Selection(positionSelection, positionSelection);
        });

        const thatMarkRanges = edits.map((edit) => {
          const { contentRange, lineDelta } = edit;
          return this.isAbove
            ? new Range(
                contentRange.start.translate({ lineDelta }),
                contentRange.end.translate({ lineDelta })
              )
            : contentRange;
        });

        return createThatMark(targets, thatMarkRanges);
      }
    );

    return {
      thatMark: thatMark.flat(),
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
