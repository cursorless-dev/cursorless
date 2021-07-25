import {
  Action,
  ActionPreferences,
  ActionReturnValue,
  Graph,
  TypedSelection,
} from "../Types";
import { performInsideOutsideAdjustment } from "../performInsideOutsideAdjustment";
import CommandAction from "../CommandAction";

export class Cut implements Action {
  targetPreferences: ActionPreferences[] = [{ insideOutsideType: null }];

  constructor(private graph: Graph) {
    this.run = this.run.bind(this);
  }

  async run([targets]: [TypedSelection[]]): Promise<ActionReturnValue> {
    await this.graph.actions.copy.run([
      targets.map((target) => performInsideOutsideAdjustment(target, "inside")),
    ]);

    const { thatMark } = await this.graph.actions.delete.run([
      targets.map((target) =>
        performInsideOutsideAdjustment(target, "outside")
      ),
    ]);

    return {
      returnValue: null,
      thatMark,
    };
  }
}

export class Copy extends CommandAction {
  constructor(graph: Graph) {
    super(graph, "editor.action.clipboardCopyAction");
  }
}

export class Paste extends CommandAction {
  constructor(graph: Graph) {
    super(graph, "editor.action.clipboardPasteAction");
  }
}
