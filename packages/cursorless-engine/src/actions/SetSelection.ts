import { Selection } from "@cursorless/common";
import { ide } from "../singletons/ide.singleton";
import { Target } from "../typings/target.types";
import { Graph } from "../typings/Graph";
import { setSelectionsAndFocusEditor } from "../util/setSelectionsAndFocusEditor";
import { ensureSingleEditor } from "../util/targetUtils";
import { Action, ActionReturnValue } from "./actions.types";

export class SetSelection implements Action {
  constructor(private graph: Graph) {
    this.run = this.run.bind(this);
  }

  protected getSelection(target: Target) {
    return target.contentSelection;
  }

  async run([targets]: [Target[]]): Promise<ActionReturnValue> {
    const editor = ensureSingleEditor(targets);

    const selections = targets.map(this.getSelection);
    await setSelectionsAndFocusEditor(ide().getEditableTextEditor(editor), selections);

    return {
      thatTargets: targets,
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
