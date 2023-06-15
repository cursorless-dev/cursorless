import { UntypedTarget } from "../../processTargets/targets";
import { SelectionWithEditor } from "../../typings/Types";

/**
 * Given a selection with an editor, constructs an appropriate `Target` to use
 * for a `that` mark.  It uses an `UntypedTarget`, and if the selection is
 * empty, it sets `hasExplicitRange` to `false`.
 *
 * @param selection The selection with editor to be converted
 * @returns A target that can be used for a `that` mark
 */
export const selectionToStoredTarget = (selection: SelectionWithEditor) =>
  new UntypedTarget({
    editor: selection.editor,
    isReversed: selection.selection.isReversed,
    contentRange: selection.selection,
    hasExplicitRange: !selection.selection.isEmpty,
  });
