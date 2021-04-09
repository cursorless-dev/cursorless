import * as vscode from "vscode";
import { addDecorationsToEditor } from "./addDecorationsToEditor";
import { COLORS, DEBOUNCE_DELAY, SymbolColor } from "./constants";
import Decorations from "./Decorations";
import NavigationMap from "./NavigationMap";

export function activate(context: vscode.ExtensionContext) {
  const decorations = new Decorations();

  var isActive = vscode.workspace
    .getConfiguration("cursorless")
    .get("showOnStart");

  function clearEditorDecorations(editor: vscode.TextEditor) {
    decorations.decorations.forEach(({ decoration }) => {
      editor.setDecorations(decoration, []);
    });
  }

  var navigationMap: NavigationMap | null = null;

  function addDecorations() {
    vscode.window.visibleTextEditors.forEach((editor) => {
      if (isActive && editor === vscode.window.activeTextEditor) {
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

  const toggleDecorationsDisposable = vscode.commands.registerCommand(
    "cursorless.toggleDecorations",
    () => {
      isActive = !isActive;
      addDecorationsDebounced();
    }
  );

  const cursorlessCommandDisposable = vscode.commands.registerTextEditorCommand(
    "cursorless.command",
    (
      editor: vscode.TextEditor,
      edit: vscode.TextEditorEdit,
      action: string,
      args: any
    ) => {
      console.log(`action: ${action}`);
      console.log(`args:`);
      console.dir(args);
    }
  );

  const selectTokenDisposable = vscode.commands.registerTextEditorCommand(
    "cursorless.selectToken",
    (
      editor: vscode.TextEditor,
      edit: vscode.TextEditorEdit,
      color?: SymbolColor,
      character?: string
    ) => {
      if (navigationMap === null) {
        return;
      }

      if (color !== undefined && character !== undefined) {
        selectToken(color, character, editor);
        return;
      }

      const inputBox = vscode.window.createInputBox();
      inputBox.show();

      inputBox.onDidChangeValue((value) => {
        if (color !== undefined && value.length === 1) {
          inputBox.dispose();

          character = value[0];
          selectToken(color, character, editor);
        }
        if (value.length === 2) {
          inputBox.dispose();

          color = COLORS.find((c) => c.startsWith(value[0]));

          if (color === undefined) {
            return;
          }

          character = value[1];
          selectToken(color, character, editor);
        }
      });
    }
  );

  addDecorationsDebounced();

  context.subscriptions.push(
    cursorlessCommandDisposable,
    selectTokenDisposable,
    toggleDecorationsDisposable,
    vscode.window.onDidChangeTextEditorVisibleRanges(addDecorationsDebounced),
    vscode.window.onDidChangeActiveTextEditor(addDecorationsDebounced),
    vscode.window.onDidChangeVisibleTextEditors(addDecorationsDebounced),
    vscode.window.onDidChangeTextEditorSelection(addDecorationsDebounced),
    vscode.workspace.onDidChangeTextDocument(addDecorationsDebounced),
    {
      dispose() {
        if (timeoutHandle !== null) {
          clearTimeout(timeoutHandle);
        }
      },
    }
  );

  function selectToken(
    color: SymbolColor,
    character: string,
    editor: vscode.TextEditor
  ) {
    const token = navigationMap!.getToken(color, character);
    editor.selection = new vscode.Selection(token.range.start, token.range.end);
  }
}

// this method is called when your extension is deactivated
export function deactivate() {}
