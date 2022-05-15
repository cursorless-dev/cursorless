import { TextEditorDecorationType, window, workspace } from "vscode";
import { EditStyle } from "../core/editStyles";
import isTesting from "../testUtil/isTesting";
import { SelectionWithEditor, TypedSelection } from "../typings/Types";
import sleep from "./sleep";
import { runForEachEditor, runOnTargetsForEachEditor } from "./targetUtils";

const getPendingEditDecorationTime = () =>
  workspace
    .getConfiguration("cursorless")
    .get<number>("pendingEditDecorationTime")!;

export async function decorationSleep() {
  if (isTesting()) {
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
  await setDecorations(targets, editStyle);

  await decorationSleep();

  clearDecorations(editStyle);
}

export function clearDecorations(editStyle: EditStyle) {
  window.visibleTextEditors.map((editor) => {
    editor.setDecorations(editStyle.token, []);
    editor.setDecorations(editStyle.line, []);
  });
}

export async function setDecorations(
  targets: TypedSelection[],
  editStyle: EditStyle
) {
  await runOnTargetsForEachEditor(targets, async (editor, selections) => {
    editor.setDecorations(
      editStyle.token,
      selections
        .filter((selection) => !useLineDecorations(selection))
        .map((selection) => selection.contentRange)
    );

    editor.setDecorations(
      editStyle.line,
      selections
        .filter((selection) => useLineDecorations(selection))
        .map((selection) => {
          const { document } = selection.editor;
          const { start, end } = selection.contentRange;
          const startLine = document.lineAt(start);
          const hasLeadingLine =
            start.character === startLine.range.end.character;
          if (
            end.character === 0 &&
            (!hasLeadingLine || start.character === 0)
          ) {
            // NB: We move end up one line because it is at beginning of
            // next line
            return selection.contentRange.with({
              end: end.translate(-1),
            });
          }
          if (hasLeadingLine) {
            // NB: We move start down one line because it is at end of
            // previous line
            return selection.contentRange.with({
              start: start.translate(1),
            });
          }
          return selection.contentRange;
        })
    );
  });
}

function useLineDecorations(selection: TypedSelection) {
  return false; // TODO
  // return (
  //   isLineSelectionType(selection.selectionType) &&
  //   selection.position === "contents"
  // );
}
