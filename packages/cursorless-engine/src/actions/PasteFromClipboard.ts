import { RangeUpdater } from "../core/updateSelections/RangeUpdater";
import { ide } from "../singletons/ide.singleton";
import type { Destination } from "../typings/target.types";
import type { Actions } from "./Actions";
import type { ActionReturnValue } from "./actions.types";
import { PasteFromClipboardUsingCommand } from "./PasteFromClipboardUsingCommand";
import { PasteFromClipboardDirectly } from "./PasteFromClipboardDirectly";

export interface DestinationWithText {
  destination: Destination;
  text: string;
}

export class PasteFromClipboard {
  private runner: PasteFromClipboardDirectly | PasteFromClipboardUsingCommand;

  constructor(rangeUpdater: RangeUpdater, actions: Actions) {
    this.run = this.run.bind(this);
    this.runner =
      ide().capabilities.commands.clipboardPaste != null
        ? new PasteFromClipboardUsingCommand(rangeUpdater, actions)
        : new PasteFromClipboardDirectly(rangeUpdater);
  }

  run(destinations: Destination[]): Promise<ActionReturnValue> {
    return this.runner.run(destinations);
  }
}
