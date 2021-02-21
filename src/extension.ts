import * as vscode from "vscode";
import { addDecorationsToEditor } from "./addDecorationsToEditor";
import { DEBOUNCE_DELAY } from "./constants";
import Decorations from "./Decorations";

export function activate(context: vscode.ExtensionContext) {
  const decorations = new Decorations();

  function clearEditorDecorations(editor: vscode.TextEditor) {
    decorations.decorations.forEach(({ decoration }) => {
      editor.setDecorations(decoration, []);
    });
  }

  function addDecorations() {
    vscode.window.visibleTextEditors.forEach((editor) => {
      if (editor === vscode.window.activeTextEditor) {
        addDecorationsToEditor(editor, decorations);
      } else {
        clearEditorDecorations(editor);
      }
    });
  }

  var timeoutHandle: NodeJS.Timeout | null = null;

  function addDecorationsDebounced() {
    if (timeoutHandle !== null) {
      clearTimeout(timeoutHandle);
    }

    timeoutHandle = setTimeout(() => {
      addDecorations();

      timeoutHandle = null;
    }, DEBOUNCE_DELAY);
  }

  // let disposable = vscode.commands.registerTextEditorCommand(
  //   "decorative-navigation.helloWorld",
  //   addDecorations
  // );

  addDecorationsDebounced();

  context.subscriptions.push(
    vscode.window.onDidChangeTextEditorVisibleRanges(addDecorationsDebounced),
    vscode.window.onDidChangeActiveTextEditor(addDecorationsDebounced),
    vscode.window.onDidChangeVisibleTextEditors(addDecorationsDebounced),
    vscode.window.onDidChangeTextEditorSelection(addDecorationsDebounced),
    {
      dispose() {
        if (timeoutHandle !== null) {
          clearTimeout(timeoutHandle);
        }
      },
    }
  );
}

// this method is called when your extension is deactivated
export function deactivate() {}
