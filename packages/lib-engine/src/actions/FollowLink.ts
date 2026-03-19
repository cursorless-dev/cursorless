import type { IDE, OpenLinkOptions } from "@cursorless/common";
import { FlashStyle } from "@cursorless/common";
import type { Target } from "../typings/target.types";
import {
  createThatMark,
  ensureSingleTarget,
  flashTargets,
} from "../util/targetUtils";
import type { ActionReturnValue, SimpleAction } from "./actions.types";

export default class FollowLink implements SimpleAction {
  constructor(
    private ide: IDE,
    private options: OpenLinkOptions,
  ) {
    this.run = this.run.bind(this);
  }

  async run(targets: Target[]): Promise<ActionReturnValue> {
    const target = ensureSingleTarget(targets);

    await flashTargets(this.ide, targets, FlashStyle.referenced);

    await this.ide
      .getEditableTextEditor(target.editor)
      .openLink(target.contentRange, this.options);

    return {
      thatSelections: createThatMark(targets),
    };
  }
}
