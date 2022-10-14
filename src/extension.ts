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
  graph.cheatsheet.init();
  graph.statusBarItem.init();

  const thatMark = new ThatMark();
  const sourceMark = new ThatMark();

  // TODO: Do this using the graph once we migrate its dependencies onto the graph
  new CommandRunner(graph, thatMark, sourceMark);

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
export function deactivate() {
  // do nothing
}
