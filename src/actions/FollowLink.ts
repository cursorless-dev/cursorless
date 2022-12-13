import ide from "../libs/cursorless-engine/singletons/ide.singleton";
import { Target } from "../typings/target.types";
import { Graph } from "../typings/Types";
import { createThatMark, ensureSingleTarget } from "../util/targetUtils";
import { Action, ActionReturnValue } from "./actions.types";

export default class FollowLink implements Action {
  constructor(private graph: Graph) {
    this.run = this.run.bind(this);
  }

  async run([targets]: [Target[]]): Promise<ActionReturnValue> {
    const target = ensureSingleTarget(targets);

    await this.graph.editStyles.displayPendingEditDecorations(
      targets,
      this.graph.editStyles.referenced,
    );

    const openedLink = await ide()
      .getEditableTextEditor(target.editor)
      .openLink(target.contentRange);

    if (!openedLink) {
      await this.graph.actions.executeCommand.run(
        [targets],
        "editor.action.revealDefinition",
        { restoreSelection: false },
      );
    }

    return {
      thatSelections: createThatMark(targets),
    };
  }
}
