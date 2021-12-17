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

    await commands.executeCommand(this.command, {
      levels: 1,
      direction: "down",
      selectionLines: targets
        .filter((target) => !target.selection.selection.isSingleLine)
        .map((target) => target.selection.selection.start.line),
    });

    // If necessary focus back original editor
    if (originalEditor != null && originalEditor !== window.activeTextEditor) {
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
