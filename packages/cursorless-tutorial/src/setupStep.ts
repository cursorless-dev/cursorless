import {
  CharacterRange,
  HatTokenMap,
  IDE,
  TestCaseSnapshot,
  TextEditor,
  TutorialState,
  plainObjectToRange,
  plainObjectToSelection,
  serializedMarksToTokenHats,
  toCharacterRange,
} from "@cursorless/common";
import { TutorialContent } from "./types/tutorial.types";

interface HighlightedEditor {
  editor: TextEditor | undefined;
  highlightRanges: CharacterRange[];
}

/**
 * Set up the current step. For example, if the current step requires that the
 * user has an editor open with certain content, this function will ensure that
 * the editor is open and has the correct content.
 *
 * Initially tries to reuse the existing editor if it's already open. If that
 * fails, it will try again with a new editor.
 *
 * @param hatTokenMap The hat token map to use for allocating hats.
 * @param editor The current editor, if any.
 * @param state The current tutorial state.
 * @param currentTutorial The current tutorial, if any.
 * @returns The editor that was set up, or `undefined` if no editor was set up.
 * If the current editor was reused, it will be returned.
 */
export async function setupStep(
  ide: IDE,
  hatTokenMap: HatTokenMap,
  editor: TextEditor | undefined,
  state: TutorialState,
  currentTutorial: TutorialContent | undefined,
): Promise<HighlightedEditor> {
  if (state.type !== "doingTutorial") {
    return { editor: undefined, highlightRanges: [] };
  }

  const { initialState: snapshot, languageId = "plaintext" } =
    currentTutorial!.steps[state.stepNumber];

  if (snapshot == null) {
    return { editor, highlightRanges: [] };
  }

  return await applySnapshot(ide, hatTokenMap, editor, snapshot, languageId);
}

async function applySnapshot(
  ide: IDE,
  hatTokenMap: HatTokenMap,
  editor: TextEditor | undefined,
  snapshot: TestCaseSnapshot,
  languageId: string,
): Promise<HighlightedEditor> {
  const retry = editor != null;

  try {
    if (editor == null) {
      editor = await ide.openUntitledTextDocument({
        content: snapshot.documentContents,
        language: languageId,
      });
    }

    const editableEditor = ide.getEditableTextEditor(editor);

    if (editableEditor.document.languageId !== languageId) {
      throw new Error(
        `Expected language id ${languageId}, but got ${editableEditor.document.languageId}`,
      );
    }

    await editableEditor.edit([
      {
        range: editableEditor.document.range,
        text: snapshot.documentContents,
        isReplace: true,
      },
    ]);

    // Ensure that the expected cursor/selections are present
    await editableEditor.setSelections(
      snapshot.selections.map(plainObjectToSelection),
    );

    // Ensure that the expected hats are present
    await hatTokenMap.allocateHats(
      serializedMarksToTokenHats(snapshot.marks, editor),
    );

    await editableEditor.focus();

    return {
      editor,
      highlightRanges: Object.values(snapshot.marks ?? {}).map((range) =>
        toCharacterRange(plainObjectToRange(range)),
      ),
    };
  } catch (err) {
    if (retry) {
      return await applySnapshot(
        ide,
        hatTokenMap,
        undefined,
        snapshot,
        languageId,
      );
    } else {
      throw err;
    }
  }
}
