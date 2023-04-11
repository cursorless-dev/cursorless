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
  HatTokenMapImpl,
  injectIde,
  RangeUpdater,
  Snippets,
  TestCaseRecorder,
  ThatMark,
  TreeSitter,
} from "@cursorless/cursorless-engine";
import {
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
  console.log("Activating Cursorless");
  const parseTreeApi = await getParseTreeApi();
  console.log("After getParseTreeApi");

  const vscodeIDE = new VscodeIDE(context);

  if (vscodeIDE.runMode !== "production") {
    injectIde(
      new NormalizedIDE(vscodeIDE, new FakeIDE(), vscodeIDE.runMode === "test"),
    );
  } else {
    injectIde(vscodeIDE);
  }

  console.log("Before getCommandServerApi");
  const commandServerApi =
    vscodeIDE.runMode === "test"
      ? getFakeCommandServerApi()
      : await getCommandServerApi();
  console.log("After getCommandServerApi");

  const getNodeAtLocation = (document: TextDocument, range: Range) => {
    return parseTreeApi.getNodeAtLocation(
      new vscode.Location(document.uri, toVscodeRange(range)),
    );
  };

  const treeSitter: TreeSitter = { getNodeAtLocation };
  const debug = new Debug(treeSitter);

  const rangeUpdater = new RangeUpdater();
  context.subscriptions.push(rangeUpdater);

  const snippets = new Snippets();
  snippets.init();

  const hats = new VscodeHats(vscodeIDE, context);
  console.log("Before hats.init()");
  await hats.init();
  console.log("After hats.init()");

  const hatTokenMap = new HatTokenMapImpl(
    rangeUpdater,
    debug,
    hats,
    commandServerApi,
  );
  hatTokenMap.allocateHats();

  const testCaseRecorder = new TestCaseRecorder(hatTokenMap);

  const actions = new Actions(snippets, rangeUpdater);

  const statusBarItem = StatusBarItem.create("cursorless.showQuickPick");
  const keyboardCommands = KeyboardCommands.create(context, statusBarItem);

  const thatMark = new ThatMark();
  const sourceMark = new ThatMark();

  const commandRunner = new CommandRunner(
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
    hats,
  );

  return {
    testHelpers: isTesting()
      ? constructTestHelpers(
          commandServerApi,
          thatMark,
          sourceMark,
          vscodeIDE,
          hatTokenMap,
        )
      : undefined,

    experimental: {
      registerThirdPartySnippets: snippets.registerThirdPartySnippets,
    },
  };
}

// this method is called when your extension is deactivated
export function deactivate() {
  // do nothing
}
