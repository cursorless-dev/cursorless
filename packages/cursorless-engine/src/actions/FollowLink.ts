import type { OpenLinkOptions } from "@cursorless/common";
import { FlashStyle } from "@cursorless/common";
import { ide } from "../singletons/ide.singleton";
import type { Target } from "../typings/target.types";
import {
  createThatMark,
  ensureSingleTarget,
  flashTargets,
} from "../util/targetUtils";
import type { ActionReturnValue, SimpleAction } from "./actions.types";

export default class FollowLink implements SimpleAction {
  constructor(private options: OpenLinkOptions) {
    this.run = this.run.bind(this);
  }

  async run(targets: Target[]): Promise<ActionReturnValue> {
    const target = ensureSingleTarget(targets);

    await flashTargets(ide(), targets, FlashStyle.referenced);

    await ide()
      .getEditableTextEditor(target.editor)
      .openLink(target.contentRange, this.options);

    return {
      thatSelections: createThatMark(targets),
    };
  }
}
