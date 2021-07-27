import {
  Action,
  ActionPreferences,
  ActionReturnValue,
  Graph,
  TypedSelection,
} from "../Types";
import { commands } from "vscode";

class EditNewLine implements Action {
  targetPreferences: ActionPreferences[] = [{ insideOutsideType: "outside" }];

  constructor(private graph: Graph, private isAbove: boolean) {
    this.run = this.run.bind(this);
  }

  async run([targets]: [TypedSelection[]]): Promise<ActionReturnValue> {
    if (this.isAbove) {
      await this.graph.actions.setSelectionBefore.run([targets]);
      await commands.executeCommand("editor.action.insertLineBefore");
    } else {
      await this.graph.actions.setSelectionAfter.run([targets]);
      await commands.executeCommand("editor.action.insertLineAfter");
    }

    return {
      returnValue: null,
      thatMark: targets.map((target) => ({
        selection: target.selection.editor.selection,
        editor: target.selection.editor,
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
