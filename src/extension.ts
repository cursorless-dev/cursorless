import { writeFileSync } from "fs";
import * as vscode from "vscode";
import Actions, { targetPreferences } from "./actions";
import { addDecorationsToEditors } from "./addDecorationsToEditor";
import { COLORS, DEBOUNCE_DELAY, SymbolColor } from "./constants";
import Decorations from "./Decorations";
import EditStyles from "./editStyles";
import { inferFullTargets } from "./inferFullTargets";
import NavigationMap from "./NavigationMap";
import processTargets from "./processTargets";
import {
  ActionPreferences,
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
    if (isActive) {
      navigationMap = addDecorationsToEditors(decorations);
    } else {
      vscode.window.visibleTextEditors.forEach(clearEditorDecorations);
      navigationMap = new NavigationMap();
    }
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
      actionName: keyof Actions,
      partialTargets: PartialTarget[],
      ...extraArgs: any[]
    ) => {
      console.log(`action: ${actionName}`);
      console.log(`targets:`);
      console.log(JSON.stringify(partialTargets, null, 3));
      console.log(`extraArgs:`);
      console.log(JSON.stringify(extraArgs, null, 3));

      const action = actions[actionName];

      const selectionContents =
        vscode.window.activeTextEditor?.selections.map((selection) =>
          vscode.window.activeTextEditor!.document.getText(selection)
        ) ?? [];

      const isPaste = actionName === "paste";

      var clipboardContents: string | undefined;
      var actionPreferences: ActionPreferences[] =
        targetPreferences[actionName];

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
        actionPreferences
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

      return await action(selections, ...extraArgs);

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

  addDecorationsDebounced();

  function handleEdit(edit: vscode.TextDocumentChangeEvent) {
    if (navigationMap != null) {
      navigationMap.updateTokenRanges(edit);
    }

    addDecorationsDebounced();
  }

  context.subscriptions.push(
    cursorlessCommandDisposable,
    toggleDecorationsDisposable,
    vscode.window.onDidChangeTextEditorVisibleRanges(addDecorationsDebounced),
    vscode.window.onDidChangeActiveTextEditor(addDecorationsDebounced),
    vscode.window.onDidChangeVisibleTextEditors(addDecorationsDebounced),
    vscode.window.onDidChangeTextEditorSelection(addDecorationsDebounced),
    vscode.workspace.onDidChangeTextDocument(handleEdit),
    {
      dispose() {
        if (timeoutHandle != null) {
          clearTimeout(timeoutHandle);
        }
      },
    }
  );
}

// this method is called when your extension is deactivated
export function deactivate() {}
