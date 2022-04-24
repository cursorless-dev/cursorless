import {
  Action,
  ActionPreferences,
  ActionReturnValue,
  TypedSelection,
  Graph,
} from "../typings/Types";
import { ensureSingleEditor } from "../util/targetUtils";
import { Selection } from "vscode";
import { setSelectionsAndFocusEditor } from "../util/setSelectionsAndFocusEditor";

export class SetSelection implements Action {
  getTargetPreferences: () => ActionPreferences[] = () => [
    { insideOutsideType: "inside" },
  ];

  constructor(private graph: Graph) {
    this.run = this.run.bind(this);
  }

  protected getSelection(target: TypedSelection) {
    return target.selection.selection;
  }

  async run([targets]: [TypedSelection[]]): Promise<ActionReturnValue> {
    const editor = ensureSingleEditor(targets);

    await setSelectionsAndFocusEditor(editor, targets.map(this.getSelection));

    return {
      thatMark: targets.map((target) => target.selection),
    };
  }
}

export class SetSelectionBefore extends SetSelection {
  protected getSelection(target: TypedSelection) {
    return new Selection(
      target.selection.selection.start,
      target.selection.selection.start
    );
  }
}

export class SetSelectionAfter extends SetSelection {
  protected getSelection(target: TypedSelection) {
    return new Selection(
      target.selection.selection.end,
      target.selection.selection.end
    );
  }
}
