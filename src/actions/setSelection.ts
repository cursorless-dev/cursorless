import {
  Action,
  ActionPreferences,
  ActionReturnValue,
  Graph,
  TypedSelection,
} from "../Types";
import { ensureSingleEditor } from "../targetUtils";
import { Selection } from "vscode";
import update from "immutability-helper";
import { setSelectionsAndFocusEditor } from "./setSelectionsAndFocusEditor";

export class SetSelection implements Action {
  targetPreferences: ActionPreferences[] = [{ insideOutsideType: "inside" }];

  constructor(private graph: Graph) {
    this.run = this.run.bind(this);
  }

  async run([targets]: [TypedSelection[]]): Promise<ActionReturnValue> {
    const editor = ensureSingleEditor(targets);

    await setSelectionsAndFocusEditor(
      editor,
      targets.map((target) => target.selection.selection)
    );

    return {
      returnValue: null,
      thatMark: targets.map((target) => target.selection),
    };
  }
}

export class SetSelectionBefore implements Action {
  targetPreferences: ActionPreferences[] = [{ insideOutsideType: "inside" }];

  constructor(private graph: Graph) {
    this.run = this.run.bind(this);
  }

  async run([targets]: [TypedSelection[]]): Promise<ActionReturnValue> {
    return await this.graph.actions.setSelection.run([
      targets.map((target) =>
        update(target, {
          selection: {
            selection: {
              $apply: (selection) =>
                new Selection(selection.start, selection.start),
            },
          },
        })
      ),
    ]);
  }
}

export class SetSelectionAfter implements Action {
  targetPreferences: ActionPreferences[] = [{ insideOutsideType: "inside" }];

  constructor(private graph: Graph) {
    this.run = this.run.bind(this);
  }

  async run([targets]: [TypedSelection[]]): Promise<ActionReturnValue> {
    return await this.graph.actions.setSelection.run([
      targets.map((target) =>
        update(target, {
          selection: {
            selection: {
              $apply: (selection) =>
                new Selection(selection.end, selection.end),
            },
          },
        })
      ),
    ]);
  }
}
