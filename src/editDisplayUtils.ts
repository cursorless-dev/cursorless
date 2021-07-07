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

async function decorationSleepWithCallback(func: () => Promise<void>) {
  const pendingEditDecorationTime = getPendingEditDecorationTime();
  const startTime = Date.now();
  await func();
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

export async function displaySelectionDecorations(
  selections: SelectionWithEditor[],
  decorationType: TextEditorDecorationType,
  func: () => Promise<void>
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

  await decorationSleepWithCallback(func);

  await runForEachEditor(
    selections,
    (s) => s.editor,
    async (editor) => {
      editor.setDecorations(decorationType, []);
    }
  );
}
