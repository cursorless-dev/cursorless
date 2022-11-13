import * as vscode from "vscode";
import TextEditorEdit from "../../libs/common/ide/types/TextEditorEdit";
import {
  toVscodeEndOfLine,
  toVscodePosition,
  toVscodePositionOrRange,
  toVscodeRange,
} from "./VscodeUtil";

export default function vscodeEditEditor(
  editor: vscode.TextEditor,
  callback: (editBuilder: TextEditorEdit) => void,
  options?: { undoStopBefore: boolean; undoStopAfter: boolean },
): Thenable<boolean> {
  return editor.edit((editBuilder) => {
    callback({
      replace: (location, value) => {
        editBuilder.replace(toVscodePositionOrRange(location), value);
      },
      insert: (location, value) => {
        editBuilder.insert(toVscodePosition(location), value);
      },
      delete: (location) => {
        return editBuilder.delete(toVscodeRange(location));
      },
      setEndOfLine: (endOfLine) => {
        return editBuilder.setEndOfLine(toVscodeEndOfLine(endOfLine));
      },
    });
  }, options);
}
