import { PlainTarget } from "../processTargets/targets";
import { ide } from "../singletons/ide.singleton";
import { Target } from "../typings/target.types";
import { setSelectionsAndFocusEditor } from "../util/setSelectionsAndFocusEditor";
import { ensureSingleEditor } from "../util/targetUtils";
import { Actions } from "./Actions";
import { SimpleAction, ActionReturnValue } from "./actions.types";

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
      await setSelectionsAndFocusEditor(
        ide().getEditableTextEditor(editor),
        thatTargets.map(({ contentSelection }) => contentSelection),
      );
    }

    return { thatTargets };
  }
}
