import { TextEditorEdit } from "@cursorless/common";
import {
  toVscodeEndOfLine,
  toVscodePosition,
  toVscodePositionOrRange,
  toVscodeRange,
} from "@cursorless/vscode-common";
import type * as vscode from "vscode";

export default async function vscodeEdit(
  editor: vscode.TextEditor,
  callback: (editBuilder: TextEditorEdit) => void,
  options?: { undoStopBefore: boolean; undoStopAfter: boolean },
): Promise<boolean> {
  return await editor.edit((editBuilder) => {
    callback({
      replace: (location, value) => {
        editBuilder.replace(toVscodePositionOrRange(location), value);
      },
      insert: (location, value) => {
        editBuilder.insert(toVscodePosition(location), value);
      },
      delete: (location) => {
        editBuilder.delete(toVscodeRange(location));
      },
      setEndOfLine: (endOfLine) => {
        editBuilder.setEndOfLine(toVscodeEndOfLine(endOfLine));
      },
    });
  }, options);
}
