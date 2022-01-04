import { commands, window } from "vscode";
import {
  Action,
  ActionPreferences,
  ActionReturnValue,
  Graph,
  TypedSelection,
} from "../typings/Types";
import { focusEditor } from "../util/setSelectionsAndFocusEditor";
import { ensureSingleEditor } from "../util/targetUtils";

class FoldAction implements Action {
  getTargetPreferences: () => ActionPreferences[] = () => [
    { insideOutsideType: "inside" },
  ];

  constructor(private command: string) {
    this.run = this.run.bind(this);
  }

  async run([targets]: [
    TypedSelection[],
    TypedSelection[]
  ]): Promise<ActionReturnValue> {
    const originalEditor = window.activeTextEditor;
    const editor = ensureSingleEditor(targets);

    if (originalEditor !== editor) {
      await focusEditor(editor);
    }

    const singleLineTargets = targets.filter(
      (target) => target.selection.selection.isSingleLine
    );
    const multiLineTargets = targets.filter(
      (target) => !target.selection.selection.isSingleLine
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
        (target) => target.selection.selection.start.line
      ),
    });

    // If necessary focus back original editor
    if (originalEditor != null && originalEditor !== editor) {
      await focusEditor(originalEditor);
    }

    return {
      thatMark: targets.map((target) => target.selection),
    };
  }
}

export class Fold extends FoldAction {
  constructor(graph: Graph) {
    super("editor.fold");
  }
}

export class Unfold extends FoldAction {
  constructor(graph: Graph) {
    super("editor.unfold");
  }
}
