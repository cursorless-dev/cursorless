import { Range, TextEditorDecorationType, window, workspace } from "vscode";
import { EditStyle } from "../core/editStyles";
import isTesting from "../testUtil/isTesting";
import { Target } from "../typings/target.types";
import { RangeWithEditor } from "../typings/Types";
import sleep from "./sleep";
import {
  getContentRange,
  isLineScopeType,
  runForEachEditor,
  runOnTargetsForEachEditor,
} from "./targetUtils";

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

export async function displayPendingEditDecorationsForTargets(
  targets: Target[],
  style: TextEditorDecorationType
) {
  await runForEachEditor(
    targets,
    (selection) => selection.editor,
    async (editor, selections) => {
      editor.setDecorations(
        style,
        selections.map((target) => target.contentRange)
      );
    }
  );

  await decorationSleep();

  await runForEachEditor(
    targets,
    (target) => target.editor,
    async (editor) => {
      editor.setDecorations(style, []);
    }
  );
}

export async function displayPendingEditDecorationsForRanges(
  ranges: RangeWithEditor[],
  style: TextEditorDecorationType
) {
  await runForEachEditor(
    ranges,
    (range) => range.editor,
    async (editor, ranges) => {
      editor.setDecorations(
        style,
        ranges.map((range) => range.range)
      );
    }
  );

  await decorationSleep();

  await runForEachEditor(
    ranges,
    (range) => range.editor,
    async (editor) => {
      editor.setDecorations(style, []);
    }
  );
}

export default async function displayPendingEditDecorations(
  targets: Target[],
  editStyle: EditStyle,
  getRange: (target: Target) => Range = getContentRange,
  contentOnly?: boolean
) {
  await setDecorations(targets, editStyle, getRange, contentOnly);

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
  targets: Target[],
  editStyle: EditStyle,
  getRange: (target: Target) => Range = getContentRange,
  contentOnly?: boolean
) {
  await runOnTargetsForEachEditor(targets, async (editor, targets) => {
    if (contentOnly) {
      editor.setDecorations(editStyle.token, targets.map(getRange));
    } else {
      editor.setDecorations(
        editStyle.token,
        targets.filter((target) => !isLineScopeType(target)).map(getRange)
      );
      editor.setDecorations(
        editStyle.line,
        targets.filter((target) => isLineScopeType(target)).map(getRange)
      );
    }
  });
}
