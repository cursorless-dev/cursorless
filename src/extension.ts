import { writeFileSync } from "fs";
import * as vscode from "vscode";
import Actions from "./actions";
import { addDecorationsToEditor } from "./addDecorationsToEditor";
import { COLORS, DEBOUNCE_DELAY, SymbolColor } from "./constants";
import Decorations from "./Decorations";
import EditStyles from "./editStyles";
import { inferFullTargets } from "./inferFullTargets";
import NavigationMap from "./NavigationMap";
import processTargets from "./processTargets";
import {
  PartialTarget,
  Position,
  ProcessedTargetsContext,
  Target,
} from "./Types";

export async function activate(context: vscode.ExtensionContext) {
  const decorations = new Decorations();
  const parseTreeExtension = vscode.extensions.getExtension("pokey.parse-tree");

  if (parseTreeExtension == null) {
    throw new Error("Depends on pokey.parse-tree extension");
  }

  const { getNodeAtLocation } = await parseTreeExtension.activate();

  var isActive = vscode.workspace
    .getConfiguration("cursorless")
    .get<boolean>("showOnStart")!;

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
    if (timeoutHandle != null) {
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

  const editStyles = new EditStyles();
  const actions = new Actions(editStyles);

  const cursorlessCommandDisposable = vscode.commands.registerCommand(
    "cursorless.command",
    async (
      actionName: keyof typeof actions,
      ...partialTargets: PartialTarget[]
    ) => {
      console.log(`action: ${actionName}`);
      console.log(`targets:`);
      console.log(JSON.stringify(partialTargets[0], null, 3));

      const action = actions[actionName];

      if (partialTargets.length !== action.length) {
        throw new Error(
          `Action ${action} expected ${action.length} args but received ${partialTargets.length}`
        );
      }

      const selectionContents =
        vscode.window.activeTextEditor?.selections.map((selection) =>
          vscode.window.activeTextEditor!.document.getText(selection)
        ) ?? [];

      const isPaste = actionName === "paste";

      var clipboardContents: string | undefined;
      var preferredPositions: (Position | null)[] =
        action.preferredPositions ?? Array(partialTargets.length).fill(null);

      if (isPaste) {
        clipboardContents = await vscode.env.clipboard.readText();
        // clipboardContents = "hello";
        // clipboardContents = "hello\n";
        // clipboardContents = "\nhello\n";
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
        currentSelections:
          vscode.window.activeTextEditor?.selections.map((selection) => ({
            selection,
            editor: vscode.window.activeTextEditor!,
          })) ?? [],
        currentEditor: vscode.window.activeTextEditor,
        navigationMap: navigationMap!,
        lastCursorPosition: [],
        getNodeAtLocation,
      };

      const selections = processTargets(processedTargetsContext, targets);

      return await action(...selections);

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
      if (navigationMap == null) {
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
        if (timeoutHandle != null) {
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
