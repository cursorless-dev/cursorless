import type { IDE } from "@cursorless/lib-common";
import { FlashStyle } from "@cursorless/lib-common";
import type { RangeUpdater } from "../core/updateSelections/RangeUpdater";
import type { Target } from "../typings/target.types";
import { flashTargets } from "../util/targetUtils";
import type { Actions } from "./Actions";
import type { ActionReturnValue, SimpleAction } from "./actions.types";
import { CopyToClipboardSimple } from "./SimpleIdeCommandActions";

interface Options {
  showDecorations?: boolean;
}

export class CopyToClipboard implements SimpleAction {
  constructor(
    private ide: IDE,
    private actions: Actions,
    private rangeUpdater: RangeUpdater,
  ) {
    this.run = this.run.bind(this);
  }

  async run(
    targets: Target[],
    options: Options = { showDecorations: true },
  ): Promise<ActionReturnValue> {
    if (this.ide.capabilities.commands.clipboardCopy != null) {
      const simpleAction = new CopyToClipboardSimple(
        this.ide,
        this.rangeUpdater,
      );
      return simpleAction.run(targets, options);
    }

    if (options.showDecorations) {
      await flashTargets(this.ide, targets, FlashStyle.referenced);
    }

    // FIXME: We should really keep track of the number of targets from the
    // original copy, as is done in VSCode.
    const text = targets.map((t) => t.contentText).join("\n");

    await this.ide.clipboard.writeText(text);

    return { thatTargets: targets };
  }
}
