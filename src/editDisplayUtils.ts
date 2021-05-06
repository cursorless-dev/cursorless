import { TextEditorDecorationType, workspace } from "vscode";
import { TypedSelection } from "./Types";
import { isLineSelectionType } from "./selectionType";
import { promisify } from "util";
import { runForEachEditor } from "./targetUtils";

const sleep = promisify(setTimeout);

export async function decorationSleep() {
  const pendingEditDecorationTime = workspace
    .getConfiguration("cursorless")
    .get<number>("pendingEditDecorationTime")!;

  await sleep(pendingEditDecorationTime);
}

export default async function displayPendingEditDecorations(
  targets: TypedSelection[],
  tokenStyle: TextEditorDecorationType,
  lineStyle: TextEditorDecorationType
) {
  await runForEachEditor(targets, async (editor, selections) => {
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

  await runForEachEditor(targets, async (editor, selections) => {
    editor.setDecorations(tokenStyle, []);
    editor.setDecorations(lineStyle, []);
  });
}
