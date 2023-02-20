import { FlashStyle } from "@cursorless/common";
import { ide } from "../singletons/ide.singleton";
import { Target } from "../typings/target.types";
import { Graph } from "../typings/Graph";
import {
  createThatMark,
  ensureSingleTarget,
  flashTargets,
} from "../util/targetUtils";
import { Action, ActionReturnValue } from "./actions.types";

export default class FollowLink implements Action {
  constructor(private graph: Graph) {
    this.run = this.run.bind(this);
  }

  async run([targets]: [Target[]]): Promise<ActionReturnValue> {
    const target = ensureSingleTarget(targets);

    await flashTargets(ide(), targets, FlashStyle.referenced);

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
