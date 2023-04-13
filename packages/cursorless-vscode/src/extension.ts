import {
  FakeIDE,
  getFakeCommandServerApi,
  isTesting,
  NormalizedIDE,
  Range,
  TextDocument,
} from "@cursorless/common";
import {
  createCursorlessEngine,
  TreeSitter,
} from "@cursorless/cursorless-engine";
import {
  createVscodeIde,
  KeyboardCommands,
  StatusBarItem,
} from "@cursorless/cursorless-vscode-core";
import {
  CursorlessApi,
  getCommandServerApi,
  getParseTreeApi,
  ParseTreeApi,
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

  const { vscodeIDE, hats } = await createVscodeIde(context);

  const commandServerApi =
    vscodeIDE.runMode === "test"
      ? getFakeCommandServerApi()
      : await getCommandServerApi();

  const treeSitter: TreeSitter = createTreeSitter(parseTreeApi);

  const normalizedIde =
    vscodeIDE.runMode === "production"
      ? undefined
      : new NormalizedIDE(
          vscodeIDE,
          new FakeIDE(),
          vscodeIDE.runMode === "test",
        );

  const {
    commandRunner,
    testCaseRecorder,
    thatMark,
    sourceMark,
    hatTokenMap,
    snippets,
    injectIde,
  } = createCursorlessEngine(
    treeSitter,
    normalizedIde ?? vscodeIDE,
    hats,
    commandServerApi,
  );

  const statusBarItem = StatusBarItem.create("cursorless.showQuickPick");
  const keyboardCommands = KeyboardCommands.create(context, statusBarItem);

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
          hatTokenMap,
          vscodeIDE,
          normalizedIde!,
          injectIde,
        )
      : undefined,

    experimental: {
      registerThirdPartySnippets: snippets.registerThirdPartySnippets,
    },
  };
}

function createTreeSitter(parseTreeApi: ParseTreeApi): TreeSitter {
  return {
    getNodeAtLocation(document: TextDocument, range: Range) {
      return parseTreeApi.getNodeAtLocation(
        new vscode.Location(document.uri, toVscodeRange(range)),
      );
    },
  };
}

// this method is called when your extension is deactivated
export function deactivate() {
  // do nothing
}
