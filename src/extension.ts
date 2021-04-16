import { writeFileSync } from "fs";
import * as vscode from "vscode";
import { addDecorationsToEditor } from "./addDecorationsToEditor";
import { COLORS, DEBOUNCE_DELAY, SymbolColor } from "./constants";
import Decorations from "./Decorations";
import { inferFullTargets } from "./inferFullTargets";
import NavigationMap from "./NavigationMap";
import processTargets from "./processTargets";
import {
  PartialTarget,
  Position,
  ProcessedTargetsContext,
  Target,
} from "./Types";

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
    async (
      editor: vscode.TextEditor,
      edit: vscode.TextEditorEdit,
      action: string,
      ...partialTargets: PartialTarget[]
    ) => {
      console.log(`action: ${action}`);
      console.log(`targets:`);
      console.log(JSON.stringify(partialTargets[0], null, 3));

      const selectionContents = editor.selections.map((selection) =>
        editor.document.getText(selection)
      );

      const isPaste = action === "paste";

      var clipboardContents: string | undefined;
      var preferredPositions: (Position | null)[] = Array(
        partialTargets.length
      ).fill(null);

      if (isPaste) {
        clipboardContents = await vscode.env.clipboard.readText();
        // clipboardContents = "hello";
        // clipboardContents = "hello\n";
        // clipboardContents = "\nhello\n";
        preferredPositions = ["after"];
      }

      const inferenceContext = {
        selectionContents,
        isPaste,
        clipboardContents,
      };

      const targets = inferFullTargets(
        inferenceContext,
        partialTargets,
        preferredPositions
      );

      const processedTargetsContext: ProcessedTargetsContext = {
        currentSelections: editor.selections.map((selection) => ({
          selection,
          documentUri: editor.document.uri,
        })),
        currentDocumentUri: editor.document.uri,
        navigationMap: navigationMap!,
        lastCursorPosition: [],
      };

      const selections = processTargets(processedTargetsContext, targets);

      // writeFileSync(
      //   "/Users/pokey/src/cursorless-vscode/inferFullTargetsTests.jsonl",
      //   JSON.stringify({
      //     input: { context, partialTargets, preferredPositions },
      //     expectedOutput: targets,
      //   }) + "\n",
      //   { flag: "a" }
      // );

      // writeFileSync(
      //   "/Users/pokey/src/cursorless-vscode/processTargetsTests.jsonl",
      //   JSON.stringify({
      //     input: {
      //       context: processedTargetsContext,
      //       targets,
      //     },
      //     expectedOutput: selections,
      //   }) + "\n",
      //   { flag: "a" }
      // );

      // const processedTargets = processTargets(navigationMap!, targets);
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
