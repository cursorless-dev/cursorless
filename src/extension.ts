import * as vscode from "vscode";
import { addDecorationsToEditor } from "./addDecorationsToEditor";
import { COLORS, DEBOUNCE_DELAY } from "./constants";
import Decorations from "./Decorations";
import NavigationMap from "./NavigationMap";

export function activate(context: vscode.ExtensionContext) {
  const decorations = new Decorations();

  function clearEditorDecorations(editor: vscode.TextEditor) {
    decorations.decorations.forEach(({ decoration }) => {
      editor.setDecorations(decoration, []);
    });
  }

  var navigationMap: NavigationMap | null = null;

  function addDecorations() {
    vscode.window.visibleTextEditors.forEach((editor) => {
      if (editor === vscode.window.activeTextEditor) {
        navigationMap = addDecorationsToEditor(editor, decorations);
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

  const selectTokenDisposable = vscode.commands.registerTextEditorCommand(
    "decorative-navigation.selectToken",
    (editor: vscode.TextEditor) => {
      if (navigationMap === null) {
        return;
      }

      const inputBox = vscode.window.createInputBox();
      inputBox.show();

      inputBox.onDidChangeValue((value) => {
        if (value.length === 2) {
          inputBox.dispose();

          const color = COLORS.find((c) => c.startsWith(value[0]));

          if (color === undefined) {
            return;
          }

          const character = value[1];
          const token = navigationMap!.getToken(color, character);
          editor.selection = new vscode.Selection(
            token.range.start,
            token.range.end
          );
        }
      });
    }
  );

  addDecorationsDebounced();

  context.subscriptions.push(
    selectTokenDisposable,
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
