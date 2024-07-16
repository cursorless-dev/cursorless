import {
  HatTokenMap,
  TextEditor,
  plainObjectToSelection,
  serializedMarksToTokenHats,
} from "@cursorless/common";
import { isEqual } from "lodash-es";
import { TutorialStep } from "./types/tutorial.types";
import { ide } from "../singletons/ide.singleton";

export async function arePreconditionsMet(
  editor: TextEditor | undefined,
  hatTokenMap: HatTokenMap,
  { initialState: snapshot, languageId }: TutorialStep,
): Promise<boolean> {
  if (snapshot == null) {
    return true;
  }

  if (ide().activeTextEditor !== editor) {
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
