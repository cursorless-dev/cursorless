import { commands } from "vscode";
import {
  Action,
  ActionPreferences,
  ActionReturnValue,
  Graph,
  TypedSelection,
} from "../typings/Types";
import { ensureSingleEditor } from "../util/targetUtils";

class FoldAction implements Action {
  targetPreferences: ActionPreferences[] = [{ insideOutsideType: "outside" }];

  constructor(private command: string) {
    this.run = this.run.bind(this);
  }

  async run([targets]: [
    TypedSelection[],
    TypedSelection[]
  ]): Promise<ActionReturnValue> {
    ensureSingleEditor(targets);

    await commands.executeCommand(this.command, {
      levels: 1,
      direction: "down",
      selectionLines: targets
        .filter((target) => !target.selection.selection.isSingleLine)
        .map((target) => target.selection.selection.start.line),
    });

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
