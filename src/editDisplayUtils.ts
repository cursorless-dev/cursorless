import { TextEditorDecorationType, workspace } from "vscode";
import { TypedSelection, SelectionWithEditor } from "./Types";
import { isLineSelectionType } from "./selectionType";
import { promisify } from "util";
import { runOnTargetsForEachEditor, runForEachEditor } from "./targetUtils";
import { EditStyle } from "./editStyles";

const sleep = promisify(setTimeout);

const getPendingEditDecorationTime = () =>
  workspace
    .getConfiguration("cursorless")
    .get<number>("pendingEditDecorationTime")!;

export async function decorationSleep() {
  if (process.env.CURSORLESS_TEST != null) {
    return;
  }

  await sleep(getPendingEditDecorationTime());
}

export async function displayPendingEditDecorationsForSelection(
  selections: SelectionWithEditor[],
  style: TextEditorDecorationType
) {
  await runForEachEditor(
    selections,
    (selection) => selection.editor,
    async (editor, selections) => {
      editor.setDecorations(
        style,
        selections.map((selection) => selection.selection)
      );
    }
  );

  await decorationSleep();

  await runForEachEditor(
    selections,
    (selection) => selection.editor,
    async (editor) => {
      editor.setDecorations(style, []);
    }
  );
}

export default async function displayPendingEditDecorations(
  targets: TypedSelection[],
  editStyle: EditStyle
) {
  await runOnTargetsForEachEditor(targets, async (editor, selections) => {
    editor.setDecorations(
      editStyle.token,
      selections
        .filter((selection) => !useLineDecorations(selection))
        .map((selection) => selection.selection.selection)
    );

    editor.setDecorations(
      editStyle.line,
      selections
        .filter((selection) => useLineDecorations(selection))
        .map((selection) => {
          const { document } = selection.selection.editor;
          const { start, end } = selection.selection.selection;
          const startLine = document.lineAt(start);
          const hasLeadingLine =
            start.character === startLine.range.end.character;
          if (
            end.character === 0 &&
            (!hasLeadingLine || start.character === 0)
          ) {
            // NB: We move end up one line because it is at beginning of
            // next line
            return selection.selection.selection.with({
              end: end.translate(-1),
            });
          }
          if (hasLeadingLine) {
            // NB: We move start down one line because it is at end of
            // previous line
            return selection.selection.selection.with({
              start: start.translate(1),
            });
          }
          return selection.selection.selection;
        })
    );
  });

  await decorationSleep();

  await runOnTargetsForEachEditor(targets, async (editor) => {
    editor.setDecorations(editStyle.token, []);
    editor.setDecorations(editStyle.line, []);
  });
}

/**
1. Shows decorations.
2. Wait for pending edit decoration time while subtracting the time it takes to actually run the callback
3. Removes decorations
*/
export async function displayDecorationsWhileRunningFunc(
  selections: SelectionWithEditor[],
  decorationType: TextEditorDecorationType,
  callback: () => Promise<void>,
  showAdditionalHighlightBeforeCallback: boolean
) {
  if (!showAdditionalHighlightBeforeCallback) {
    await callback();
  }

  await runForEachEditor(
    selections,
    (s) => s.editor,
    async (editor, selections) => {
      editor.setDecorations(
        decorationType,
        selections.map((s) => s.selection)
      );
    }
  );

  const pendingEditDecorationTime = getPendingEditDecorationTime();

  if (showAdditionalHighlightBeforeCallback) {
    await sleep(pendingEditDecorationTime);
    await callback();
  }

  await sleep(pendingEditDecorationTime);

  await runForEachEditor(
    selections,
    (s) => s.editor,
    async (editor) => {
      editor.setDecorations(decorationType, []);
    }
  );
}

function useLineDecorations(selection: TypedSelection) {
  return (
    isLineSelectionType(selection.selectionType) &&
    selection.position === "contents"
  );
}
