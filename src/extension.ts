import * as vscode from "vscode";
import { addDecorationsToEditors } from "./addDecorationsToEditor";
import { DEBOUNCE_DELAY } from "./constants";
import Decorations from "./Decorations";
import graphConstructors from "./graphConstructors";
import { inferFullTargets } from "./inferFullTargets";
import processTargets from "./processTargets";
import FontMeasurements from "./FontMeasurements";
import { ActionType, PartialTarget, ProcessedTargetsContext } from "./Types";
import makeGraph from "./makeGraph";
import { logBranchTypes } from "./debug";
import { TestCase } from "./TestCase";
import { ThatMark } from "./ThatMark";
import { Clipboard } from "./Clipboard";
import { TestCaseRecorder } from "./TestCaseRecorder";

export async function activate(context: vscode.ExtensionContext) {
  const fontMeasurements = new FontMeasurements(context);
  await fontMeasurements.calculate();
  const decorations = new Decorations(fontMeasurements);

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

  function addDecorations() {
    if (isActive) {
      addDecorationsToEditors(graph.navigationMap, decorations);
    } else {
      vscode.window.visibleTextEditors.forEach(clearEditorDecorations);
      graph.navigationMap.clear();
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

  const recomputeDecorationStylesDisposable = vscode.commands.registerCommand(
    "cursorless.recomputeDecorationStyles",
    () => {
      fontMeasurements.clearCache();
      recomputeDecorationStyles();
    }
  );

  const graph = makeGraph(graphConstructors);
  const thatMark = new ThatMark();
  const testCaseRecorder = new TestCaseRecorder(context);
  const cursorlessRecordTestCaseDisposable = vscode.commands.registerCommand(
    "cursorless.recordTestCase",
    async () => {
      console.log("Recording test case for next command");
      testCaseRecorder.start();
    }
  );
  const cursorlessCommandDisposable = vscode.commands.registerCommand(
    "cursorless.command",
    async (
      actionName: ActionType,
      partialTargets: PartialTarget[],
      ...extraArgs: any[]
    ) => {
      try {
        console.debug(`action: ${actionName}`);
        console.debug(`partialTargets:`);
        console.debug(JSON.stringify(partialTargets, null, 3));
        console.debug(`extraArgs:`);
        console.debug(JSON.stringify(extraArgs, null, 3));

        const action = graph.actions[actionName];

        const selectionContents =
          vscode.window.activeTextEditor?.selections.map((selection) =>
            vscode.window.activeTextEditor!.document.getText(selection)
          ) ?? [];

        const isPaste = actionName === "paste";

        var clipboardContents: string | undefined;

        if (isPaste) {
          clipboardContents = await Clipboard.readText();
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
          action.targetPreferences
        );
        // console.log(`targets:`);
        // console.log(JSON.stringify(targets, null, 3));

        const processedTargetsContext: ProcessedTargetsContext = {
          currentSelections:
            vscode.window.activeTextEditor?.selections.map((selection) => ({
              selection,
              editor: vscode.window.activeTextEditor!,
            })) ?? [],
          currentEditor: vscode.window.activeTextEditor,
          navigationMap: graph.navigationMap,
          thatMark: thatMark.get(),
          getNodeAtLocation,
        };

        const selections = processTargets(processedTargetsContext, targets);

        let testCase: TestCase | null = null;
        if (testCaseRecorder.active) {
          const command = { actionName, partialTargets, extraArgs };
          const context = {
            targets,
            thatMark: thatMark,
            navigationMap: graph.navigationMap!,
            spokenForm: testCaseRecorder.spokenForm ?? "",
          };
          testCase = new TestCase(command, context);
          await testCase.recordInitialState();
        }

        const { returnValue, thatMark: newThatMark } = await action.run(
          selections,
          ...extraArgs
        );

        thatMark.set(newThatMark);

        if (testCase != null) {
          await testCase.recordFinalState(returnValue);
          await testCaseRecorder.finish(testCase);
        }

        return returnValue;

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
      } catch (e) {
        vscode.window.showErrorMessage(e.message);
        console.trace(e.message);
        throw e;
      }
    }
  );

  addDecorationsDebounced();

  function handleEdit(edit: vscode.TextDocumentChangeEvent) {
    graph.navigationMap.updateTokenRanges(edit);

    addDecorationsDebounced();
  }

  const recomputeDecorationStyles = async () => {
    decorations.destroyDecorations();
    await fontMeasurements.calculate();
    decorations.constructDecorations(fontMeasurements);
    addDecorations();
  };

  context.subscriptions.push(
    cursorlessCommandDisposable,
    cursorlessRecordTestCaseDisposable,
    toggleDecorationsDisposable,
    recomputeDecorationStylesDisposable,
    vscode.workspace.onDidChangeConfiguration(recomputeDecorationStyles),
    vscode.window.onDidChangeTextEditorVisibleRanges(addDecorationsDebounced),
    vscode.window.onDidChangeActiveTextEditor(addDecorationsDebounced),
    vscode.window.onDidChangeVisibleTextEditors(addDecorationsDebounced),
    vscode.window.onDidChangeTextEditorSelection(addDecorationsDebounced),
    vscode.window.onDidChangeTextEditorSelection(
      logBranchTypes(getNodeAtLocation)
    ),
    vscode.workspace.onDidChangeTextDocument(handleEdit),
    {
      dispose() {
        if (timeoutHandle != null) {
          clearTimeout(timeoutHandle);
        }
      },
    }
  );

  return {
    navigationMap: graph.navigationMap,
    thatMark,
    addDecorations,
  };
}

// this method is called when your extension is deactivated
export function deactivate() {}
