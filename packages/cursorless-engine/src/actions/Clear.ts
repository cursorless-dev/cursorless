import { PlainTarget } from "../processTargets/targets";
import { ide } from "../singletons/ide.singleton";
import type { Target } from "../typings/target.types";
import { ensureSingleEditor } from "../util/targetUtils";
import type { Actions } from "./Actions";
import type { SimpleAction, ActionReturnValue } from "./actions.types";

export default class Clear implements SimpleAction {
  constructor(private actions: Actions) {
    this.run = this.run.bind(this);
  }

  async run(targets: Target[]): Promise<ActionReturnValue> {
    const editor = ensureSingleEditor(targets);
    // Convert to plain targets so that the remove action just removes the
    // content range instead of the removal range
    const plainTargets = targets.map(
      (target) =>
        new PlainTarget({
          editor: target.editor,
          isReversed: target.isReversed,
          contentRange: target.contentRange,
        }),
    );

    const { thatTargets } = await this.actions.remove.run(plainTargets);

    if (thatTargets != null) {
      await ide()
        .getEditableTextEditor(editor)
        .setSelections(
          thatTargets.map(({ contentSelection }) => contentSelection),
          { focusEditor: true },
        );
    }

    return { thatTargets };
  }
}
