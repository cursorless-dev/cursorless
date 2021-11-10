import * as vscode from "vscode";
import graphFactories from "./util/graphFactories";
import inferFullTargets from "./core/inferFullTargets";
import processTargets from "./processTargets";
import { Graph, PartialTarget, ProcessedTargetsContext } from "./typings/Types";
import makeGraph, { FactoryMap } from "./util/makeGraph";
import { logBranchTypes } from "./util/debug";
import { ThatMark } from "./core/ThatMark";
import { TestCaseRecorder } from "./testUtil/TestCaseRecorder";
import { getCommandServerApi, getParseTreeApi } from "./util/getExtensionApi";
import { canonicalizeAndValidateCommand } from "./util/canonicalizeAndValidateCommand";
import { doTargetsUsePrePhraseSnapshot } from "./util/doTargetsUsePrePhraseSnapshot";
import isTesting from "./testUtil/isTesting";

export async function activate(context: vscode.ExtensionContext) {
  const { getNodeAtLocation } = await getParseTreeApi();
  const commandServerApi = await getCommandServerApi();

  const graph = makeGraph({
    ...graphFactories,
    extensionContext: () => context,
    commandServerApi: () => commandServerApi,
  } as FactoryMap<Graph>);
  graph.snippets.init();
  await graph.decorations.init();
  graph.hatTokenMap.init();

  const thatMark = new ThatMark();
  const sourceMark = new ThatMark();
  const testCaseRecorder = new TestCaseRecorder(context);

  const cursorlessRecordTestCaseDisposable = vscode.commands.registerCommand(
    "cursorless.recordTestCase",
    async (isHatTokenMapTest: boolean = false) => {
      if (testCaseRecorder.active) {
        vscode.window.showInformationMessage("Stopped recording test cases");
        testCaseRecorder.stop();
      } else {
        if (await testCaseRecorder.start(isHatTokenMapTest)) {
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

        const usePrePhraseSnapshot =
          doTargetsUsePrePhraseSnapshot(partialTargets);
        const readableHatMap = await graph.hatTokenMap.getReadableMap(
          usePrePhraseSnapshot
        );

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
          hatTokenMap: readableHatMap,
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
            hatTokenMap: readableHatMap,
            spokenForm,
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

        // const processedTargets = processTargets(hatTokenMap!, targets);
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

  function handleEdit(edit: vscode.TextDocumentChangeEvent) {
    // TODO. Disabled for now because it triggers on undo as well
    //  wait until next release when there is a cause field
    // checkForEditsOutsideViewport(edit);
  }

  // vscode.workspace.onDidChangeTextDocument(handleEdit)

  function checkForEditsOutsideViewport(event: vscode.TextDocumentChangeEvent) {
    // TODO: Only activate this code during the course of a cursorless action
    // Can register pre/post command hooks the way we do with test case recorder
    // TODO: Move this thing to a graph component
    // TODO: Need to move command executor and test case recorder to graph
    // component while we're doing this stuff so it's easier to register the
    // hooks
    // TODO: Should run this code even if document is not in a visible editor
    // as long as we are during the course of a cursorless command.
    // See https://github.com/pokey/cursorless-vscode/issues/320
    const editor = vscode.window.activeTextEditor;

    if (
      editor == null ||
      editor.document !== event.document ||
      event.reason === vscode.TextDocumentChangeReason.Undo ||
      event.reason === vscode.TextDocumentChangeReason.Redo
    ) {
      return;
    }

    const ranges = event.contentChanges
      .filter(
        (contentChange) =>
          !editor.visibleRanges.some(
            (visibleRange) =>
              contentChange.range.intersection(visibleRange) != null
          )
      )
      .map(({ range }) => range);

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

  context.subscriptions.push(
    cursorlessCommandDisposable,
    cursorlessRecordTestCaseDisposable,
    vscode.window.onDidChangeTextEditorSelection(
      logBranchTypes(getNodeAtLocation)
    )
  );

  return {
    thatMark,
    sourceMark,
    graph: isTesting() ? graph : undefined,
    experimental: {
      registerThirdPartySnippets: graph.snippets.registerThirdPartySnippets,
    },
  };
}

// this method is called when your extension is deactivated
export function deactivate() {}
