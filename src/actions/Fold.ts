import { commands } from "vscode";
import { Target } from "../typings/target.types";
import { Graph } from "../typings/Types";
import { focusEditor } from "../util/setSelectionsAndFocusEditor";
import { createThatMark, ensureSingleEditor } from "../util/targetUtils";
import { Action, ActionReturnValue } from "./actions.types";
import { getActiveTextEditor } from "../ide/vscode/activeTextEditor";

class FoldAction implements Action {
  constructor(private command: string) {
    this.run = this.run.bind(this);
  }

  async run([targets]: [Target[], Target[]]): Promise<ActionReturnValue> {
    const originalEditor = getActiveTextEditor();
    const editor = ensureSingleEditor(targets);

    if (originalEditor !== editor) {
      await focusEditor(editor);
    }

    const singleLineTargets = targets.filter(
      (target) => target.contentRange.isSingleLine,
    );
    const multiLineTargets = targets.filter(
      (target) => !target.contentRange.isSingleLine,
    );
    // Don't mix multi and single line targets.
    // This is probably the result of an "every" command
    // and folding the single line targets will fold the parent as well
    const selectedTargets = multiLineTargets.length
      ? multiLineTargets
      : singleLineTargets;

    await commands.executeCommand(this.command, {
      levels: 1,
      direction: "down",
      selectionLines: selectedTargets.map(
        (target) => target.contentRange.start.line,
      ),
    });

    // If necessary focus back original editor
    if (originalEditor != null && originalEditor !== editor) {
      await focusEditor(originalEditor);
    }

    return {
      thatSelections: createThatMark(targets),
    };
  }
}

export class Fold extends FoldAction {
  constructor(_graph: Graph) {
    super("editor.fold");
  }
}

export class Unfold extends FoldAction {
  constructor(_graph: Graph) {
    super("editor.unfold");
  }
}
