import { ensureSingleEditor, getContentSelection } from "../util/targetUtils";
import { Selection } from "vscode";
import { setSelectionsAndFocusEditor } from "../util/setSelectionsAndFocusEditor";
import { Target } from "../typings/target.types";
import { Graph } from "../typings/Types";
import { Action, ActionReturnValue } from "./actions.types";

export class SetSelection implements Action {
  constructor(private graph: Graph) {
    this.run = this.run.bind(this);
  }

  protected getSelection(target: Target) {
    return getContentSelection(target);
  }

  async run([targets]: [Target[]]): Promise<ActionReturnValue> {
    const editor = ensureSingleEditor(targets);

    const selections = targets.map(this.getSelection);
    await setSelectionsAndFocusEditor(editor, selections);

    return {
      thatMark: selections.map((selection) => ({
        editor,
        selection,
      })),
    };
  }
}

export class SetSelectionBefore extends SetSelection {
  protected getSelection(target: Target) {
    return new Selection(target.contentRange.start, target.contentRange.start);
  }
}

export class SetSelectionAfter extends SetSelection {
  protected getSelection(target: Target) {
    return new Selection(target.contentRange.end, target.contentRange.end);
  }
}
