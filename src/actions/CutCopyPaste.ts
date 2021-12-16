import {
  Action,
  ActionPreferences,
  ActionReturnValue,
  Graph,
  TypedSelection,
} from "../typings/Types";
import { performInsideOutsideAdjustment } from "../util/performInsideOutsideAdjustment";
import CommandAction from "./CommandAction";
import displayPendingEditDecorations from "../util/editDisplayUtils";
import { getOutsideOverflow } from "../util/targetUtils";
import { zip } from "lodash";

export class Cut implements Action {
  getTargetPreferences: () => ActionPreferences[] = () => [
    { insideOutsideType: null },
  ];

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

    await this.graph.actions.copyToClipboard.run([insideTargets], options);

    const { thatMark } = await this.graph.actions.remove.run(
      [outsideTargets],
      options
    );

    return { thatMark };
  }
}

export class Copy extends CommandAction {
  constructor(graph: Graph) {
    super(graph, {
      command: "editor.action.clipboardCopyAction",
      ensureSingleEditor: true,
    });
  }
}

export class Paste extends CommandAction {
  constructor(graph: Graph) {
    super(graph, {
      command: "editor.action.clipboardPasteAction",
      ensureSingleEditor: true,
    });
  }
}
