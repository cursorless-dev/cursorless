import { Target } from "../typings/target.types";
import { Graph } from "../typings/Types";
import displayPendingEditDecorations from "../util/editDisplayUtils";
import {
  getOutsideOverflow,
  getRemovalHighlightRange,
} from "../util/targetUtils";
import { Action, ActionReturnValue } from "./actions.types";
import CommandAction from "./CommandAction";

export class Cut implements Action {
  constructor(private graph: Graph) {
    this.run = this.run.bind(this);
  }

  async run([targets]: [Target[]]): Promise<ActionReturnValue> {
    const overflowTargets = targets.flatMap((target) =>
      getOutsideOverflow(
        target.editor,
        target.contentRange,
        getRemovalHighlightRange(target)
      ).map(
        (overflow): Target => ({
          editor: target.editor,
          scopeType: target.scopeType,
          contentRange: overflow,
          isReversed: false,
        })
      )
    );

    await Promise.all([
      displayPendingEditDecorations(targets, this.graph.editStyles.referenced),
      displayPendingEditDecorations(
        overflowTargets,
        this.graph.editStyles.pendingDelete
      ),
    ]);

    const options = { showDecorations: false };

    await this.graph.actions.copyToClipboard.run([targets], options);

    const { thatMark } = await this.graph.actions.remove.run(
      [targets],
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
      showDecorations: true,
    });
  }
}

export class Paste extends CommandAction {
  constructor(graph: Graph) {
    super(graph, {
      command: "editor.action.clipboardPasteAction",
      ensureSingleEditor: true,
      showDecorations: true,
    });
  }
}
