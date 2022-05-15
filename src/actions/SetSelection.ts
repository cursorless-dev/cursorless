import {
  Action,
  ActionPreferences,
  ActionReturnValue,
  Graph,
} from "../typings/Types";
import { ensureSingleEditor } from "../util/targetUtils";
import { Selection } from "vscode";
import { setSelectionsAndFocusEditor } from "../util/setSelectionsAndFocusEditor";
import { Target } from "../typings/target.types";

export class SetSelection implements Action {
  getTargetPreferences: () => ActionPreferences[] = () => [
    { insideOutsideType: "inside" },
  ];

  constructor(private graph: Graph) {
    this.run = this.run.bind(this);
  }

  protected getSelection(target: Target) {
    return target.isReversed
      ? new Selection(target.contentRange.end, target.contentRange.start)
      : new Selection(target.contentRange.start, target.contentRange.end);
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
