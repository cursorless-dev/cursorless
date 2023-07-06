import { workspace, window } from "vscode";
import { Vscode } from "@cursorless/vscode-common";

export function createVscodeApi(): Vscode {
  return {
    workspace,
    window,
    editor: {
      setDecorations(editor, ...args) {
        return editor.setDecorations(...args);
      },
    },
  };
}
