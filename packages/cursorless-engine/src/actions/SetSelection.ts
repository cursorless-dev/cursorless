import { Selection } from "@cursorless/common";
import { ide } from "../singletons/ide.singleton";
import type { Target } from "../typings/target.types";
import { ensureSingleEditor } from "../util/targetUtils";
import type { SimpleAction, ActionReturnValue } from "./actions.types";

export class SetSelection implements SimpleAction {
  constructor(private append: boolean = false) {
    this.run = this.run.bind(this);
  }

  protected getSelection(target: Target): Selection {
    return target.contentSelection;
  }

  async run(targets: Target[]): Promise<ActionReturnValue> {
    const editor = ensureSingleEditor(targets);

    const targetSelections = targets.map(this.getSelection);

    const selections = this.append
      ? editor.selections.concat(targetSelections)
      : targetSelections;

    await ide()
      .getEditableTextEditor(editor)
      .setSelections(selections, { focusEditor: true });

    return {
      thatTargets: targets,
    };
  }
}

export class SetSelectionBefore extends SetSelection {
  protected getSelection(target: Target) {
    return new Selection(target.contentRange.start, target.contentRange.start);
  }
}

export class SetSelectionAfter extends SetSelection {
  protected getSelection(target: Target) {
    return new Selection(target.contentRange.end, target.contentRange.end);
  }
}

export class AppendSelection extends SetSelection {
  constructor() {
    super(true);
  }
}
