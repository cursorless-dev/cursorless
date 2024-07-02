import { FlashStyle } from "@cursorless/common";
import { ide } from "../singletons/ide.singleton";
import { Target } from "../typings/target.types";
import {
  createThatMark,
  ensureSingleTarget,
  flashTargets,
} from "../util/targetUtils";
import { Actions } from "./Actions";
import { SimpleAction, ActionReturnValue } from "./actions.types";

export default class FollowLink implements SimpleAction {
  openInSplit = false;
  constructor(
    private actions: Actions,
    private options: { openInSplit: boolean },
  ) {
    this.run = this.run.bind(this);
    this.options = options;
  }

  async run(targets: Target[]): Promise<ActionReturnValue> {
    const target = ensureSingleTarget(targets);

    await flashTargets(ide(), targets, FlashStyle.referenced);

    const openedLink = await ide()
      .getEditableTextEditor(target.editor)
      .openLink(target.contentRange, this.options);

    return {
      thatSelections: createThatMark(targets),
    };
  }
}
