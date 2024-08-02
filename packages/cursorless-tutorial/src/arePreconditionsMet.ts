import type { HatTokenMap, TextEditor } from "@cursorless/common";
import {
  plainObjectToSelection,
  serializedMarksToTokenHats,
} from "@cursorless/common";
import { isEqual } from "lodash-es";
import type { TutorialStep } from "./types/tutorial.types";

/**
 * Given an editor, a hat token map, and a tutorial step, check if the preconditions
 * for the step are met.
 *
 * @param editor The editor to check.
 * @param hatTokenMap The hat token map to use for checking if hats are correct.
 * @param step The tutorial step whose prerequesites are to be checked.
 * @returns `true` if the preconditions are met, `false` otherwise.
 */
export async function arePreconditionsMet(
  activeTextEditor: TextEditor | undefined,
  editor: TextEditor | undefined,
  hatTokenMap: HatTokenMap,
  { initialState: snapshot, languageId }: TutorialStep,
): Promise<boolean> {
  if (snapshot == null) {
    return true;
  }

  if (activeTextEditor !== editor) {
    return false;
  }

  if (editor == null || editor.document.languageId !== languageId) {
    return false;
  }

  if (editor.document.getText() !== snapshot.documentContents) {
    return false;
  }

  if (
    !isEqual(editor.selections, snapshot.selections.map(plainObjectToSelection))
  ) {
    return false;
  }

  const readableHatMap = await hatTokenMap.getReadableMap(false);
  for (const mark of serializedMarksToTokenHats(snapshot.marks, editor)) {
    if (
      !readableHatMap
        .getToken(mark.hatStyle, mark.grapheme)
        ?.range.isRangeEqual(mark.hatRange)
    ) {
      return false;
    }
  }

  return true;
}
