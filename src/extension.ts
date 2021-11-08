import * as vscode from "vscode";
import { addDecorationsToEditors } from "./util/addDecorationsToEditor";
import { DECORATION_DEBOUNCE_DELAY } from "./core/constants";
import graphFactories from "./util/graphFactories";
import inferFullTargets from "./core/inferFullTargets";
import processTargets from "./processTargets";
import { Graph, PartialTarget, ProcessedTargetsContext } from "./typings/Types";
import makeGraph, { FactoryMap } from "./util/makeGraph";
import { logBranchTypes } from "./util/debug";
import { TestCase } from "./testUtil/TestCase";
import { ThatMark } from "./core/ThatMark";
import { TestCaseRecorder } from "./testUtil/TestCaseRecorder";
import { getCommandServerApi, getParseTreeApi } from "./util/getExtensionApi";
import { canonicalizeAndValidateCommand } from "./util/canonicalizeAndValidateCommand";
import { mkdir, stat } from "fs/promises";
import { join } from "path";
import { getPrimitiveTargets } from "./util/targetUtils";
import { doTargetsUseSnapshot } from "./util/doTargetsRequireSnapshot";

export async function activate(context: vscode.ExtensionContext) {
  const { getNodeAtLocation } = await getParseTreeApi();
  const commandServerApi = await getCommandServerApi();

  var isActive = vscode.workspace
    .getConfiguration("cursorless")
    .get<boolean>("showOnStart")!;

  function clearEditorDecorations(editor: vscode.TextEditor) {
    graph.decorations.decorations.forEach(({ decoration }) => {
      editor.setDecorations(decoration, []);
    });
  }

  async function addDecorations() {
    if (isActive) {
      addDecorationsToEditors(graph.navigationMap, graph.decorations);
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
    }, DECORATION_DEBOUNCE_DELAY);
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
      graph.fontMeasurements.clearCache();
      recomputeDecorationStyles();
    }
  );

  const graph = makeGraph({
    ...graphFactories,
    extensionContext: () => context,
    commandServerApi: () => commandServerApi,
  } as FactoryMap<Graph>);
  graph.snippets.init();
  await graph.fontMeasurements.calculate();

  const thatMark = new ThatMark();
  const sourceMark = new ThatMark();
  const testCaseRecorder = new TestCaseRecorder(context);

  const cursorlessRecordTestCaseDisposable = vscode.commands.registerCommand(
    "cursorless.recordTestCase",
    async (isNavigationMapTest: boolean = false) => {
      if (testCaseRecorder.active) {
        vscode.window.showInformationMessage("Stopped recording test cases");
        testCaseRecorder.stop();
      } else {
        if (await testCaseRecorder.start(isNavigationMapTest)) {
          vscode.window.showInformationMessage(
            `Recording test cases for following commands in:\n${testCaseRecorder.fixtureSubdirectory}`
          );
        }
      }
    }
  );

  const cursorlessCommandDisposable = vscode.commands.registerCommand(
    "cursorless.command",
    async (
      spokenForm: string,
      inputActionName: string,
      inputPartialTargets: PartialTarget[],
      ...inputExtraArgs: unknown[]
    ) => {
      try {
        const { actionName, partialTargets, extraArgs } =
          canonicalizeAndValidateCommand(
            inputActionName,
            inputPartialTargets,
            inputExtraArgs
          );

        const useSnapshot = doTargetsUseSnapshot(partialTargets);
        if (useSnapshot) {
          await graph.navigationMap.maybeTakeSnapshot();
        }

        console.debug(`spokenForm: ${spokenForm}`);
        console.debug(`action: ${actionName}`);
        console.debug(`partialTargets:`);
        console.debug(JSON.stringify(partialTargets, null, 3));
        console.debug(`extraArgs:`);
        console.debug(JSON.stringify(extraArgs, null, 3));

        const action = graph.actions[actionName];

        if (action == null) {
          throw new Error(`Unknown action ${actionName}`);
        }

        const targets = inferFullTargets(
          partialTargets,
          action.getTargetPreferences(...extraArgs)
        );

        const processedTargetsContext: ProcessedTargetsContext = {
          currentSelections:
            vscode.window.activeTextEditor?.selections.map((selection) => ({
              selection,
              editor: vscode.window.activeTextEditor!,
            })) ?? [],
          currentEditor: vscode.window.activeTextEditor,
          navigationMap: graph.navigationMap,
          thatMark: thatMark.exists() ? thatMark.get() : [],
          sourceMark: sourceMark.exists() ? sourceMark.get() : [],
          getNodeAtLocation,
        };

        const selections = processTargets(processedTargetsContext, targets);

        if (testCaseRecorder.active) {
          const command = { actionName, partialTargets, extraArgs };
          const context = {
            targets,
            thatMark,
            sourceMark,
            navigationMap: graph.navigationMap!,
            spokenForm,
            useSnapshot,
          };
          await testCaseRecorder.preCommandHook(command, context);
        }

        const {
          returnValue,
          thatMark: newThatMark,
          sourceMark: newSourceMark,
        } = await action.run(selections, ...extraArgs);

        thatMark.set(newThatMark);
        sourceMark.set(newSourceMark);

        if (testCaseRecorder.active) {
          await testCaseRecorder.postCommandHook(returnValue);
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
        testCaseRecorder.commandErrorHook();
        const err = e as Error;
        vscode.window.showErrorMessage(err.message);
        console.debug(err.message);
        console.debug(err.stack);
        throw err;
      }
    }
  );

  addDecorationsDebounced();

  function checkForEditsOutsideViewport(event: vscode.TextDocumentChangeEvent) {
    const editor = vscode.window.activeTextEditor;
    if (editor == null || editor.document !== event.document) {
      return;
    }
    const { start } = editor.visibleRanges[0];
    const { end } = editor.visibleRanges[editor.visibleRanges.length - 1];
    const ranges = [];
    for (const edit of event.contentChanges) {
      if (
        edit.range.end.isBeforeOrEqual(start) ||
        edit.range.start.isAfterOrEqual(end)
      ) {
        ranges.push(edit.range);
      }
    }
    if (ranges.length > 0) {
      ranges.sort((a, b) => a.start.line - b.start.line);
      const linesText = ranges
        .map((range) => `${range.start.line + 1}-${range.end.line + 1}`)
        .join(", ");
      vscode.window.showWarningMessage(
        `Modification outside of viewport at lines: ${linesText}`
      );
    }
  }

  function handleEdit(edit: vscode.TextDocumentChangeEvent) {
    addDecorationsDebounced();

    // TODO. Disabled for now because it triggers on undo as well
    //  wait until next release when there is a cause field
    // checkForEditsOutsideViewport(edit);
  }

  const recomputeDecorationStyles = async () => {
    graph.decorations.destroyDecorations();
    await graph.fontMeasurements.calculate();
    graph.decorations.constructDecorations(graph.fontMeasurements);
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
    sourceMark,
    addDecorations,
    experimental: {
      registerThirdPartySnippets: graph.snippets.registerThirdPartySnippets,
    },
  };
}

// this method is called when your extension is deactivated
export function deactivate() {}
