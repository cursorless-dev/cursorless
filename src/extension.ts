import * as vscode from "vscode";
import graphFactories from "./util/graphFactories";
import { Graph } from "./typings/Types";
import makeGraph, { FactoryMap } from "./util/makeGraph";
import { ThatMark } from "./core/ThatMark";
import { getCommandServerApi, getParseTreeApi } from "./util/getExtensionApi";
import isTesting from "./testUtil/isTesting";
import CommandRunner from "./core/commandRunner/CommandRunner";

/**
 * Extension entrypoint called by VSCode on Cursorless startup.
 * - Creates a dependency container {@link Graph} with the components that
 * implement Cursorless.
 * - Creates test case recorder {@link TestCaseRecorder} for contributors to
 * use to record test cases.
 * - Creates an entrypoint for running commands {@link CommandRunner}.
 */
export async function activate(context: vscode.ExtensionContext) {
  const { getNodeAtLocation } = await getParseTreeApi();
  const commandServerApi = await getCommandServerApi();

  const graph = makeGraph({
    ...graphFactories,
    extensionContext: () => context,
    commandServerApi: () => commandServerApi,
    getNodeAtLocation: () => getNodeAtLocation,
  } as FactoryMap<Graph>);
  graph.debug.init();
  graph.snippets.init();
  await graph.decorations.init();
  graph.hatTokenMap.init();
  graph.testCaseRecorder.init();

  const thatMark = new ThatMark();
  const sourceMark = new ThatMark();

  // TODO: Do this using the graph once we migrate its dependencies onto the graph
  new CommandRunner(graph, thatMark, sourceMark);

  // Disabled for now.
  // See https://github.com/cursorless-dev/cursorless/issues/320
  // vscode.workspace.onDidChangeTextDocument(checkForEditsOutsideViewport)
  function _checkForEditsOutsideViewport(
    event: vscode.TextDocumentChangeEvent
  ) {
    // TODO: Only activate this code during the course of a cursorless action
    // Can register pre/post command hooks the way we do with test case recorder
    // TODO: Move this thing to a graph component
    // TODO: Need to move command executor and test case recorder to graph
    // component while we're doing this stuff so it's easier to register the
    // hooks
    // TODO: Should run this code even if document is not in a visible editor
    // as long as we are during the course of a cursorless command.
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
