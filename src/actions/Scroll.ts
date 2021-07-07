import {
  Action,
  ActionPreferences,
  ActionReturnValue,
  Graph,
  TypedSelection,
  SelectionWithEditor,
} from "../Types";
import { displaySelectionDecorations } from "../editDisplayUtils";
import { groupBy } from "../itertools";
import { commands, TextEditor, Selection, window } from "vscode";
import { focusEditor } from "./setSelectionsAndFocusEditor";

class Scroll implements Action {
  targetPreferences: ActionPreferences[] = [{ insideOutsideType: "inside" }];

  constructor(private graph: Graph, private at: string) {
    this.run = this.run.bind(this);
  }

  async run([targets]: [TypedSelection[]]): Promise<ActionReturnValue> {
    const selectionGroups = groupBy(
      targets,
      (t: TypedSelection) => t.selection.editor
    );

    const selections: SelectionWithEditor[] = [];
    const lines: LineWithEditor[] = [];

    [...selectionGroups].forEach(([editor, targets]) => {
      const { lineNumber, lineNumberDecorate } = getLineNumber(
        targets,
        this.at
      );
      lines.push({ lineNumber, editor });
      selections.push({
        selection: new Selection(lineNumberDecorate, 0, lineNumberDecorate, 0),
        editor,
      });
    });

    await displaySelectionDecorations(
      selections,
      this.graph.editStyles.referencedLine
    );

    const originalEditor = <TextEditor>window.activeTextEditor;

    await Promise.all(
      lines.map(async (lineWithEditor) => {
        // For reveal line to the work we have to have the correct editor focused
        if (lineWithEditor.editor !== window.activeTextEditor) {
          await focusEditor(lineWithEditor.editor);
        }
        await commands.executeCommand("revealLine", {
          lineNumber: lineWithEditor.lineNumber,
          at: this.at,
        });
      })
    );

    // If necessary focus back original editor
    if (originalEditor !== window.activeTextEditor) {
      await focusEditor(originalEditor);
    }

    return {
      returnValue: null,
      thatMark: targets.map((target) => target.selection),
    };
  }
}

export class ScrollToTop extends Scroll {
  constructor(graph: Graph) {
    super(graph, "top");
  }
}

export class ScrollToCenter extends Scroll {
  constructor(graph: Graph) {
    super(graph, "center");
  }
}

export class ScrollToBottom extends Scroll {
  constructor(graph: Graph) {
    super(graph, "bottom");
  }
}

function getLineNumber(targets: TypedSelection[], at: string) {
  let startLine = Number.MAX_SAFE_INTEGER;
  let endLine = 0;
  targets.forEach((t: TypedSelection) => {
    startLine = Math.min(startLine, t.selection.selection.start.line);
    endLine = Math.max(endLine, t.selection.selection.end.line);
  });

  let lineNumber, lineNumberDecorate;
  if (at === "top") {
    lineNumber = lineNumberDecorate = startLine;
  } else if (at === "bottom") {
    // Necessary change to actually get vscode to put line at absolute bottom.function
    lineNumber = Math.max(0, endLine - 1);
    lineNumberDecorate = endLine;
  } else {
    lineNumber = lineNumberDecorate = Math.floor((startLine + endLine) / 2);
  }

  return { lineNumber, lineNumberDecorate };
}

interface LineWithEditor {
  editor: TextEditor;
  lineNumber: number;
}
