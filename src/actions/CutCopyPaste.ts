import {
  Action,
  ActionPreferences,
  ActionReturnValue,
  Graph,
  TypedSelection,
} from "../Types";
import { performInsideOutsideAdjustment } from "../performInsideOutsideAdjustment";
import CommandAction from "../CommandAction";
import displayPendingEditDecorations from "../editDisplayUtils";
import { getOutsideOverflow } from "../targetUtils";
import { zip } from "lodash";

export class Cut implements Action {
  targetPreferences: ActionPreferences[] = [{ insideOutsideType: null }];

  constructor(private graph: Graph) {
    this.run = this.run.bind(this);
  }

  async run([targets]: [TypedSelection[]]): Promise<ActionReturnValue> {
    const insideTargets = targets.map((target) =>
      performInsideOutsideAdjustment(target, "inside")
    );
    const outsideTargets = targets.map((target) =>
      performInsideOutsideAdjustment(target, "outside")
    );
    const outsideTargetDecorations = zip(insideTargets, outsideTargets).flatMap(
      ([inside, outside]) => getOutsideOverflow(inside!, outside!)
    );
    const options = { showDecorations: false };

    await Promise.all([
      displayPendingEditDecorations(
        insideTargets,
        this.graph.editStyles.referenced
      ),
      displayPendingEditDecorations(
        outsideTargetDecorations,
        this.graph.editStyles.pendingDelete
      ),
    ]);

    await this.graph.actions.copy.run([insideTargets], options);

    const { thatMark } = await this.graph.actions.delete.run(
      [outsideTargets],
      options
    );

    return {
      returnValue: null,
      thatMark,
    };
  }
}

const OPTIONS = { ensureSingleEditor: true };

export class Copy extends CommandAction {
  constructor(graph: Graph) {
    super(graph, "editor.action.clipboardCopyAction", OPTIONS);
  }
}

export class Paste extends CommandAction {
  constructor(graph: Graph) {
    super(graph, "editor.action.clipboardPasteAction", OPTIONS);
  }
}
