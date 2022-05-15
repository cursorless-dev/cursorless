import { Range, TextEditorDecorationType, window, workspace } from "vscode";
import { EditStyle } from "../core/editStyles";
import isTesting from "../testUtil/isTesting";
import { Target } from "../typings/target.types";
import { SelectionWithEditor } from "../typings/Types";
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
  targets: Target[],
  editStyle: EditStyle,
  getRange: (target: Target) => Range,
  contentOnly?: boolean
) {
  await setDecorations(targets, editStyle, getRange, contentOnly);

  await decorationSleep();

  clearDecorations(editStyle);
}

function clearDecorations(editStyle: EditStyle) {
  window.visibleTextEditors.map((editor) => {
    editor.setDecorations(editStyle.token, []);
    editor.setDecorations(editStyle.line, []);
  });
}

async function setDecorations(
  targets: Target[],
  editStyle: EditStyle,
  getRange: (target: Target) => Range,
  contentOnly?: boolean
) {
  await runOnTargetsForEachEditor(targets, async (editor, targets) => {
    if (contentOnly) {
      editor.setDecorations(editStyle.token, targets.map(getRange));
    } else {
      editor.setDecorations(
        editStyle.token,
        targets.filter((target) => !useLineDecorations(target)).map(getRange)
      );
      editor.setDecorations(
        editStyle.line,
        targets.filter((target) => useLineDecorations(target)).map(getRange)
      );
    }
  });
}

function useLineDecorations(target: Target) {
  switch (target.scopeType) {
    case "line":
    case "paragraph":
    case "document":
      return true;
    default:
      return false;
  }
}
