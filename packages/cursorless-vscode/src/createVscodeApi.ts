import { workspace, window } from "vscode";
import { Vscode } from "@cursorless/vscode-common";

export function createVscodeApi(): Vscode {
  return {
    workspace: {
      onDidChangeConfiguration: workspace.onDidChangeConfiguration,
      getConfiguration: workspace.getConfiguration,
    },
    window: {
      createTextEditorDecorationType: window.createTextEditorDecorationType,
    },
    editor: {
      setDecorations(editor, ...args) {
        return editor.setDecorations(...args);
      },
    },
  };
}
