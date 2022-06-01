import PlainTarget from "../processTargets/targets/PlainTarget";
import { Target } from "../typings/target.types";
import { Graph } from "../typings/Types";
import { getOutsideOverflow } from "../util/targetUtils";
import { Action, ActionReturnValue } from "./actions.types";
import CommandAction from "./CommandAction";

export class Cut implements Action {
  constructor(private graph: Graph) {
    this.run = this.run.bind(this);
  }

  async run([targets]: [Target[]]): Promise<ActionReturnValue> {
    const overflowTargets = targets.flatMap((target) => {
      const range = target.getRemovalHighlightRange();
      if (range == null) {
        return [];
      }
      return getOutsideOverflow(target.editor, target.contentRange, range).map(
        (overflow): Target =>
          // TODO Instead of creating a new target display decorations by range
          new PlainTarget({
            editor: target.editor,
            contentRange: overflow,
            isReversed: target.isReversed,
          })
      );
    });

    await Promise.all([
      this.graph.editStyles.displayPendingEditDecorations(
        targets,
        this.graph.editStyles.referenced
      ),
      this.graph.editStyles.displayPendingEditDecorations(
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
