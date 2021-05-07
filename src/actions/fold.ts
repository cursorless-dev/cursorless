import { commands } from "vscode";
import {
  Action,
  ActionPreferences,
  ActionReturnValue,
  Graph,
  TypedSelection,
} from "../Types";
import { ensureSingleEditor } from "../targetUtils";

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
      selectionLines: targets.map(
        (target) => target.selection.selection.start.line
      ),
    });

    return {
      returnValue: null,
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
