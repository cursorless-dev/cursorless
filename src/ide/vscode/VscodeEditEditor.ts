import { TextEditorEdit } from "@cursorless/common";
import {
  toVscodeEndOfLine,
  toVscodePosition,
  toVscodePositionOrRangeOrSelection,
  toVscodeRangeOrSelection,
} from "@cursorless/vscode-common";
import * as vscode from "vscode";

export default function vscodeEditEditor(
  editor: vscode.TextEditor,
  callback: (editBuilder: TextEditorEdit) => void,
  options?: { undoStopBefore: boolean; undoStopAfter: boolean },
): Thenable<boolean> {
  return editor.edit((editBuilder) => {
    callback({
      replace: (location, value) => {
        editBuilder.replace(
          toVscodePositionOrRangeOrSelection(location),
          value,
        );
      },
      insert: (location, value) => {
        editBuilder.insert(toVscodePosition(location), value);
      },
      delete: (location) => {
        editBuilder.delete(toVscodeRangeOrSelection(location));
      },
      setEndOfLine: (endOfLine) => {
        editBuilder.setEndOfLine(toVscodeEndOfLine(endOfLine));
      },
    });
  }, options);
}
