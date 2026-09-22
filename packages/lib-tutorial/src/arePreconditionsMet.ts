import { isEqual } from "lodash-es";
import type { HatTokenMap, TextEditor } from "@cursorless/lib-common";
import {
  plainObjectToSelection,
  serializedMarksToTokenHats,
} from "@cursorless/lib-common";
import type { TutorialStep } from "./types/tutorial.types";

/**
 * Given an editor, a hat token map, and a tutorial step, check if the preconditions
 * for the step are met.
 *
 * @param editor The editor to check.
 * @param hatTokenMap The hat token map to use for checking if hats are correct.
 * @param step The tutorial step whose prerequesites are to be checked.
 * @returns A description of the first failed precondition, or `undefined` if
 * all preconditions are met.
 */
export async function arePreconditionsMet(
  activeTextEditor: TextEditor | undefined,
  editor: TextEditor | undefined,
  hatTokenMap: HatTokenMap,
  { initialState: snapshot, languageId }: TutorialStep,
): Promise<string | undefined> {
  if (snapshot == null) {
    return undefined;
  }

  if (activeTextEditor !== editor) {
    return `Active editor differs from tutorial editor`;
  }

  if (editor == null) {
    return "Tutorial editor is unavailable";
  }

  if (editor.document.languageId !== languageId) {
    return `Language differs (expected: ${languageId}, actual: ${editor.document.languageId})`;
  }

  if (editor.document.getText() !== snapshot.documentContents) {
    return "Document contents differ";
  }

  const expectedSelections = snapshot.selections.map(plainObjectToSelection);
  if (!isEqual(editor.selections, expectedSelections)) {
    const expected = expectedSelections
      .map((selection) => selection.concise())
      .join(", ");
    const actual = editor.selections
      .map((selection) => selection.concise())
      .join(", ");
    return `Selections differ (expected: ${expected}, actual: ${actual})`;
  }

  const readableHatMap = await hatTokenMap.getReadableMap(false);
  for (const mark of serializedMarksToTokenHats(snapshot.marks, editor)) {
    const actualRange = readableHatMap.getToken(
      mark.hatStyle,
      mark.grapheme,
    )?.range;
    if (!actualRange?.isRangeEqual(mark.hatRange)) {
      return `Hat ${mark.hatStyle}.${mark.grapheme} differs (expected: ${mark.hatRange.concise()}, actual: ${actualRange?.concise() ?? "none"})`;
    }
  }

  return undefined;
}
