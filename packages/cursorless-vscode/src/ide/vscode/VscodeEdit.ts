import { Edit } from "@cursorless/common";
import { toVscodePosition, toVscodeRange } from "@cursorless/vscode-common";
import type * as vscode from "vscode";

export default async function vscodeEdit(
  editor: vscode.TextEditor,
  edits: Edit[],
): Promise<boolean> {
  return await editor.edit((editBuilder) => {
    edits.forEach(({ range, text, isReplace }) => {
      if (text === "") {
        editBuilder.delete(toVscodeRange(range));
      } else if (range.isEmpty && !isReplace) {
        editBuilder.insert(toVscodePosition(range.start), text);
      } else {
        editBuilder.replace(toVscodeRange(range), text);
      }
    });
  });
}
