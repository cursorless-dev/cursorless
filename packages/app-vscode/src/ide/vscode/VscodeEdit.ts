import type * as vscode from "vscode";
import type { Edit } from "@cursorless/lib-common";
import { toVscodePosition, toVscodeRange } from "@cursorless/lib-vscode-common";

export async function vscodeEdit(
  editor: vscode.TextEditor,
  edits: Edit[],
): Promise<boolean> {
  return await editor.edit((editBuilder) => {
    for (const { range, text, isReplace } of edits) {
      if (text === "") {
        editBuilder.delete(toVscodeRange(range));
      } else if (range.isEmpty && !isReplace) {
        editBuilder.insert(toVscodePosition(range.start), text);
      } else {
        editBuilder.replace(toVscodeRange(range), text);
      }
    }
  });
}
