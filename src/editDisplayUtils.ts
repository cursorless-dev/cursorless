import { TextEditorDecorationType, workspace, TextEditor } from "vscode";
import { TypedSelection, SelectionWithEditor } from "./Types";
import { isLineSelectionType } from "./selectionType";
import { promisify } from "util";
import { runOnTargetsForEachEditor, runForEachEditor } from "./targetUtils";

const sleep = promisify(setTimeout);

const getPendingEditDecorationTime = () =>
  workspace
    .getConfiguration("cursorless")
    .get<number>("pendingEditDecorationTime")!;

export async function decorationSleep() {
  await sleep(getPendingEditDecorationTime());
}

/**
Wait for pending edit decoration time while subtracting the time it takes to actually run the callback
*/
async function decorationSleepWithCallback(
  timeoutWaitForCallBack: () => Promise<void>
) {
  const pendingEditDecorationTime = getPendingEditDecorationTime();
  const startTime = Date.now();
  await timeoutWaitForCallBack();
  const deltaTime = Date.now() - startTime;
  await sleep(pendingEditDecorationTime - deltaTime);
}

export default async function displayPendingEditDecorations(
  targets: TypedSelection[],
  tokenStyle: TextEditorDecorationType,
  lineStyle: TextEditorDecorationType
) {
  await runOnTargetsForEachEditor(targets, async (editor, selections) => {
    editor.setDecorations(
      tokenStyle,
      selections
        .filter((selection) => !isLineSelectionType(selection.selectionType))
        .map((selection) => selection.selection.selection)
    );

    editor.setDecorations(
      lineStyle,
      selections
        .filter((selection) => isLineSelectionType(selection.selectionType))
        .map((selection) =>
          selection.selection.selection.with(
            undefined,
            // NB: We move end up one line because it is at beginning of
            // next line
            selection.selection.selection.end.translate(-1)
          )
        )
    );
  });

  await decorationSleep();

  await runOnTargetsForEachEditor(targets, async (editor) => {
    editor.setDecorations(tokenStyle, []);
    editor.setDecorations(lineStyle, []);
  });
}

/**
1. Shows decorations.
2. Wait for pending edit decoration time while subtracting the time it takes to actually run the callback
3. Removes decorations
*/
export async function displaySelectionDecorations(
  selections: SelectionWithEditor[],
  decorationType: TextEditorDecorationType,
  timeoutWaitForCallBack: () => Promise<void>
) {
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

  await decorationSleepWithCallback(timeoutWaitForCallBack);

  await runForEachEditor(
    selections,
    (s) => s.editor,
    async (editor) => {
      editor.setDecorations(decorationType, []);
    }
  );
}
