import {
  FakeIDE,
  getFakeCommandServerApi,
  isTesting,
  NormalizedIDE,
  Range,
  TextDocument,
} from "@cursorless/common";
import {
  Actions,
  CommandRunner,
  Debug,
  FactoryMap,
  Graph,
  graphFactories,
  HatTokenMapImpl,
  injectIde,
  makeGraph,
  TestCaseRecorder,
  ThatMark,
  TreeSitter,
} from "@cursorless/cursorless-engine";
import {
  commandIds,
  KeyboardCommands,
  StatusBarItem,
  VscodeHats,
  VscodeIDE,
} from "@cursorless/cursorless-vscode-core";
import {
  CursorlessApi,
  getCommandServerApi,
  getParseTreeApi,
  toVscodeRange,
} from "@cursorless/vscode-common";
import * as vscode from "vscode";
import { constructTestHelpers } from "./constructTestHelpers";
import { registerCommands } from "./registerCommands";

/**
 * Extension entrypoint called by VSCode on Cursorless startup.
 * - Creates a dependency container {@link Graph} with the components that
 * implement Cursorless.
 * - Creates test case recorder {@link TestCaseRecorder} for contributors to
 * use to record test cases.
 * - Creates an entrypoint for running commands {@link CommandRunner}.
 */
export async function activate(
  context: vscode.ExtensionContext,
): Promise<CursorlessApi> {
  const parseTreeApi = await getParseTreeApi();

  const vscodeIDE = new VscodeIDE(context);

  if (vscodeIDE.runMode !== "production") {
    injectIde(
      new NormalizedIDE(vscodeIDE, new FakeIDE(), vscodeIDE.runMode === "test"),
    );
  } else {
    injectIde(vscodeIDE);
  }

  const commandServerApi =
    vscodeIDE.runMode === "test"
      ? getFakeCommandServerApi()
      : await getCommandServerApi();

  const getNodeAtLocation = (document: TextDocument, range: Range) => {
    return parseTreeApi.getNodeAtLocation(
      new vscode.Location(document.uri, toVscodeRange(range)),
    );
  };

  const treeSitter: TreeSitter = { getNodeAtLocation };
  const debug = new Debug(treeSitter);

  const graph = makeGraph({
    ...graphFactories,
    extensionContext: () => context,
    commandServerApi: () => commandServerApi,
  } as FactoryMap<Graph>);
  graph.snippets.init();

  const hats = new VscodeHats(vscodeIDE, context);
  await hats.init();

  const hatTokenMap = new HatTokenMapImpl(graph, debug, hats);
  await hatTokenMap.allocateHats();

  const testCaseRecorder = new TestCaseRecorder(hatTokenMap);

  const actions = new Actions(graph);

  const statusBarItem = StatusBarItem.create(commandIds.showQuickPick);
  const keyboardCommands = KeyboardCommands.create(context, statusBarItem);

  const thatMark = new ThatMark();
  const sourceMark = new ThatMark();

  const commandRunner = new CommandRunner(
    graph,
    treeSitter,
    debug,
    hatTokenMap,
    testCaseRecorder,
    actions,
    thatMark,
    sourceMark,
  );

  registerCommands(
    context,
    vscodeIDE,
    commandRunner,
    testCaseRecorder,
    keyboardCommands,
  );

  return {
    testHelpers: isTesting()
      ? constructTestHelpers(
          commandServerApi,
          thatMark,
          sourceMark,
          vscodeIDE,
          graph,
          hatTokenMap,
        )
      : undefined,

    experimental: {
      registerThirdPartySnippets: graph.snippets.registerThirdPartySnippets,
    },
  };
}

// this method is called when your extension is deactivated
export function deactivate() {
  // do nothing
}
